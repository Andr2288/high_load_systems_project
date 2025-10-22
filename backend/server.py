from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import urlparse
from database import users_collection, user_settings_collection
from models import User, UserSettings
from auth_utils import create_access_token, get_user_from_token
from bson import ObjectId
import re
from datetime import datetime


class FlashEngHandler(BaseHTTPRequestHandler):

    def _set_cors_headers(self):
        """Set CORS headers for all responses"""
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def _send_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _get_request_body(self):
        """Get and parse request body"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        return json.loads(body.decode('utf-8')) if body else {}

    def _get_token_from_header(self):
        """Extract token from Authorization header"""
        auth_header = self.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            return auth_header[7:]
        return None

    def _verify_admin(self, token):
        """Check if user is admin"""
        user_data = get_user_from_token(token)
        if user_data and user_data['role'] == 'admin':
            return user_data
        return None

    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Auth endpoints
        if path == '/api/auth/signup':
            self.handle_signup()
        elif path == '/api/auth/login':
            self.handle_login()

        # Admin endpoints
        elif path == '/api/admin/users':
            self.handle_admin_create_user()

        else:
            self._send_response(404, {'error': 'Endpoint not found'})

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Auth endpoints
        if path == '/api/auth/check':
            self.handle_check_auth()
        elif path == '/api/auth/me':
            self.handle_get_me()

        # Admin endpoints
        elif path == '/api/admin/users':
            self.handle_admin_get_users()

        else:
            self._send_response(404, {'error': 'Endpoint not found'})

    def do_PUT(self):
        """Handle PUT requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Admin endpoints
        if path.startswith('/api/admin/users/') and path.endswith('/toggle-status'):
            self.handle_admin_toggle_user_status(path)

        else:
            self._send_response(404, {'error': 'Endpoint not found'})

    def do_DELETE(self):
        """Handle DELETE requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Admin endpoints
        if path.startswith('/api/admin/users/'):
            self.handle_admin_delete_user(path)

        else:
            self._send_response(404, {'error': 'Endpoint not found'})

    # ==================== AUTH HANDLERS ====================

    def handle_signup(self):
        """Handle user registration"""
        try:
            data = self._get_request_body()

            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            full_name = data.get('fullName', '').strip()

            if not email or not password or not full_name:
                self._send_response(400, {'error': 'All fields are required'})
                return

            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                self._send_response(400, {'error': 'Invalid email format'})
                return

            if len(password) < 6:
                self._send_response(400, {'error': 'Password must be at least 6 characters'})
                return

            if users_collection.find_one({'email': email}):
                self._send_response(400, {'error': 'User already exists'})
                return

            user = User(full_name, email, password, role='user')
            result = users_collection.insert_one(user.to_dict())

            # Create default settings for user
            settings = UserSettings(str(result.inserted_id))
            user_settings_collection.insert_one(settings.to_dict())

            token = create_access_token(result.inserted_id, email, 'user')

            user_response = {
                '_id': str(result.inserted_id),
                'full_name': full_name,
                'email': email,
                'role': 'user',
                'profile_picture': None
            }

            self._send_response(201, {
                'message': 'User created successfully',
                'user': user_response,
                'token': token
            })

        except Exception as e:
            print(f"Signup error: {e}")
            self._send_response(500, {'error': 'Server error'})

    def handle_login(self):
        """Handle user login"""
        try:
            data = self._get_request_body()

            email = data.get('email', '').strip().lower()
            password = data.get('password', '')

            if not email or not password:
                self._send_response(400, {'error': 'Email and password are required'})
                return

            user_doc = users_collection.find_one({'email': email})

            if not user_doc:
                self._send_response(401, {'error': 'Invalid credentials'})
                return

            if not user_doc.get('is_active', True):
                self._send_response(403, {'error': 'Account is deactivated'})
                return

            if not User.verify_password(password, user_doc['password']):
                self._send_response(401, {'error': 'Invalid credentials'})
                return

            token = create_access_token(
                user_doc['_id'],
                user_doc['email'],
                user_doc['role']
            )

            user_response = {
                '_id': str(user_doc['_id']),
                'full_name': user_doc['full_name'],
                'email': user_doc['email'],
                'role': user_doc['role'],
                'profile_picture': user_doc.get('profile_picture')
            }

            self._send_response(200, {
                'message': 'Login successful',
                'user': user_response,
                'token': token
            })

        except Exception as e:
            print(f"Login error: {e}")
            self._send_response(500, {'error': 'Server error'})

    def handle_check_auth(self):
        """Check if user is authenticated"""
        try:
            token = self._get_token_from_header()

            if not token:
                self._send_response(401, {'error': 'No token provided'})
                return

            user_data = get_user_from_token(token)

            if not user_data:
                self._send_response(401, {'error': 'Invalid token'})
                return

            user_doc = users_collection.find_one({'_id': ObjectId(user_data['user_id'])})

            if not user_doc:
                self._send_response(401, {'error': 'User not found'})
                return

            user_response = {
                '_id': str(user_doc['_id']),
                'full_name': user_doc['full_name'],
                'email': user_doc['email'],
                'role': user_doc['role'],
                'profile_picture': user_doc.get('profile_picture')
            }

            self._send_response(200, user_response)

        except Exception as e:
            print(f"Check auth error: {e}")
            self._send_response(500, {'error': 'Server error'})

    def handle_get_me(self):
        """Get current user info"""
        self.handle_check_auth()

    # ==================== ADMIN HANDLERS ====================

    def handle_admin_create_user(self):
        """Admin: Create new user"""
        try:
            token = self._get_token_from_header()

            if not token:
                self._send_response(401, {'error': 'No token provided'})
                return

            admin_data = self._verify_admin(token)

            if not admin_data:
                self._send_response(403, {'error': 'Admin access required'})
                return

            data = self._get_request_body()

            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            full_name = data.get('fullName', '').strip()
            role = data.get('role', 'user')

            if not email or not password or not full_name:
                self._send_response(400, {'error': 'All fields are required'})
                return

            if role not in ['user', 'admin']:
                self._send_response(400, {'error': 'Invalid role'})
                return

            if users_collection.find_one({'email': email}):
                self._send_response(400, {'error': 'User already exists'})
                return

            user = User(full_name, email, password, role=role)
            result = users_collection.insert_one(user.to_dict())

            user_response = {
                '_id': str(result.inserted_id),
                'full_name': full_name,
                'email': email,
                'role': role,
                'profile_picture': None
            }

            self._send_response(201, {
                'message': 'User created successfully',
                'user': user_response
            })

        except Exception as e:
            print(f"Admin create user error: {e}")
            self._send_response(500, {'error': 'Server error'})

    def handle_admin_get_users(self):
        """Admin: Get all users"""
        try:
            token = self._get_token_from_header()

            if not token:
                self._send_response(401, {'error': 'No token provided'})
                return

            admin_data = self._verify_admin(token)

            if not admin_data:
                self._send_response(403, {'error': 'Admin access required'})
                return

            users = list(users_collection.find({}, {'password': 0}))

            users_response = []
            for user in users:
                users_response.append({
                    '_id': str(user['_id']),
                    'full_name': user['full_name'],
                    'email': user['email'],
                    'role': user['role'],
                    'is_active': user.get('is_active', True),
                    'created_at': user['created_at'].isoformat()
                })

            self._send_response(200, {
                'users': users_response,
                'total': len(users_response)
            })

        except Exception as e:
            print(f"Admin get users error: {e}")
            self._send_response(500, {'error': 'Server error'})

    def handle_admin_toggle_user_status(self, path):
        """Admin: Toggle user status"""
        try:
            token = self._get_token_from_header()

            if not token:
                self._send_response(401, {'error': 'No token provided'})
                return

            admin_data = self._verify_admin(token)

            if not admin_data:
                self._send_response(403, {'error': 'Admin access required'})
                return

            user_id = path.split('/')[4]
            user_doc = users_collection.find_one({'_id': ObjectId(user_id)})

            if not user_doc:
                self._send_response(404, {'error': 'User not found'})
                return

            if str(user_doc['_id']) == admin_data['user_id']:
                self._send_response(400, {'error': 'Cannot deactivate your own account'})
                return

            new_status = not user_doc.get('is_active', True)

            users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'is_active': new_status, 'updated_at': datetime.utcnow()}}
            )

            self._send_response(200, {
                'message': f"User {'activated' if new_status else 'deactivated'} successfully",
                'is_active': new_status
            })

        except Exception as e:
            print(f"Admin toggle status error: {e}")
            self._send_response(500, {'error': 'Server error'})

    def handle_admin_delete_user(self, path):
        """Admin: Delete user"""
        try:
            token = self._get_token_from_header()

            if not token:
                self._send_response(401, {'error': 'No token provided'})
                return

            admin_data = self._verify_admin(token)

            if not admin_data:
                self._send_response(403, {'error': 'Admin access required'})
                return

            user_id = path.split('/')[4]
            user_doc = users_collection.find_one({'_id': ObjectId(user_id)})

            if not user_doc:
                self._send_response(404, {'error': 'User not found'})
                return

            if str(user_doc['_id']) == admin_data['user_id']:
                self._send_response(400, {'error': 'Cannot delete your own account'})
                return

            users_collection.delete_one({'_id': ObjectId(user_id)})

            self._send_response(200, {
                'message': 'User deleted successfully'
            })

        except Exception as e:
            print(f"Admin delete user error: {e}")
            self._send_response(500, {'error': 'Server error'})


def run_server(port=5001):
    """Start HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, FlashEngHandler)
    print(f'✓ Server running on http://localhost:{port}')
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()