from http.server import HTTPServer, BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from urllib.parse import urlparse
from database import users_collection, user_settings_collection, categories_collection, flashcards_collection
from models import User, UserSettings, Category, Flashcard
from auth_utils import create_access_token, get_user_from_token
from bson import ObjectId
import re
from datetime import datetime
import threading
import traceback
from ai_service import generate_complete_flashcard, generate_examples, regenerate_examples, translate_to_ukrainian, translate_sentence_to_ukrainian


class FlashEngHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        """Override to add more detailed logging"""
        print(f"🌐 {self.address_string()} - {format % args}")

    def _set_cors_headers(self):
        """Set CORS headers for all responses"""
        environment = os.getenv('ENVIRONMENT', 'development')

        print(f"🔧 Setting CORS headers for environment: {environment}")

        if environment == 'production':
            # Production CORS - specific domains
            frontend_url = os.getenv('FRONTEND_URL', 'https://roaring-sherbet-285aee.netlify.app')
            print(f"🔧 Production CORS - Frontend URL: {frontend_url}")
            self.send_header('Access-Control-Allow-Origin', frontend_url)
        else:
            # Development CORS - localhost
            print("🔧 Development CORS - allowing localhost:5173")
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173')

        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def _send_response(self, status_code, data):
        """Send JSON response with error handling"""
        try:
            json_data = json.dumps(data, ensure_ascii=False)
            print(f"📤 Sending response: {status_code} - {json_data[:200]}...")

            self.send_response(status_code)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', len(json_data.encode('utf-8')))
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json_data.encode('utf-8'))
        except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError, OSError) as e:
            print(f"⚠️ Connection error: {e}")
        except Exception as e:
            print(f"❌ Error sending response: {e}")
            print(traceback.format_exc())

    def _get_request_body(self):
        """Get and parse request body"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            print(f"📥 Request body length: {content_length}")

            if content_length == 0:
                return {}

            body = self.rfile.read(content_length)
            body_str = body.decode('utf-8')
            print(f"📥 Request body: {body_str[:200]}...")

            return json.loads(body_str) if body_str else {}
        except Exception as e:
            print(f"❌ Error parsing request body: {e}")
            print(traceback.format_exc())
            return {}

    def _get_token_from_header(self):
        """Extract token from Authorization header"""
        auth_header = self.headers.get('Authorization', '')
        print(f"🔐 Auth header: {auth_header[:50]}...")

        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            print(f"🔐 Extracted token: {token[:20]}...")
            return token
        return None

    def _verify_admin(self, token):
        """Check if user is admin"""
        user_data = get_user_from_token(token)
        if user_data and user_data['role'] == 'admin':
            print(f"✅ Admin verified: {user_data['email']}")
            return user_data
        print("❌ Admin verification failed")
        return None

    def _get_user_from_request(self):
        """Get authenticated user from request"""
        token = self._get_token_from_header()
        if not token:
            print("❌ No token found in request")
            return None

        user_data = get_user_from_token(token)
        if user_data:
            print(f"✅ User authenticated: {user_data['email']}")
        else:
            print("❌ Token verification failed")
        return user_data

    def do_OPTIONS(self):
        """Handle preflight requests"""
        try:
            print("🔄 Handling OPTIONS request")
            self.send_response(200)
            self._set_cors_headers()
            self.end_headers()
        except Exception as e:
            print(f"❌ OPTIONS error: {e}")

    def do_GET(self):
        """Handle GET requests"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            print(f"📨 GET request to: {path}")

            # Health check endpoint
            if path == '/health' or path == '/api/health':
                self.handle_health_check()

            # Environment info endpoint
            elif path == '/api/info':
                self.handle_environment_info()

            # Auth endpoints
            elif path == '/api/auth/check':
                self.handle_check_auth()
            elif path == '/api/auth/me':
                self.handle_get_me()

            # Admin endpoints
            elif path == '/api/admin/users':
                self.handle_admin_get_users()

            # Settings endpoints
            elif path == '/api/settings':
                self.handle_get_settings()

            # Category endpoints
            elif path == '/api/categories':
                self.handle_get_categories()
            elif path.startswith('/api/categories/') and '/flashcards' in path:
                self.handle_get_flashcards_by_category(path)

            # Flashcard endpoints
            elif path == '/api/flashcards':
                self.handle_get_flashcards()
            elif path.startswith('/api/flashcards/'):
                self.handle_get_flashcard(path)

            else:
                print(f"❌ Endpoint not found: {path}")
                self._send_response(404, {'error': f'Endpoint not found: {path}'})

        except Exception as e:
            print(f"❌ GET error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def do_POST(self):
        """Handle POST requests"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            print(f"📨 POST request to: {path}")

            # Auth endpoints
            if path == '/api/auth/signup':
                self.handle_signup()
            elif path == '/api/auth/login':
                self.handle_login()

            # Admin endpoints
            elif path == '/api/admin/users':
                self.handle_admin_create_user()

            # Category endpoints
            elif path == '/api/categories':
                self.handle_create_category()

            # Flashcard endpoints
            elif path == '/api/flashcards':
                self.handle_create_flashcard()
            elif path == '/api/flashcards/generate':
                self.handle_generate_flashcard()

            # AI endpoints
            elif path == '/api/ai/generate-examples':
                self.handle_ai_generate_examples()
            elif path == '/api/ai/regenerate-examples':
                self.handle_ai_regenerate_examples()
            elif path == '/api/ai/translate':
                self.handle_ai_translate()
            elif path == '/api/ai/translate-sentence':
                self.handle_ai_translate_sentence()

            else:
                print(f"❌ Endpoint not found: {path}")
                self._send_response(404, {'error': f'Endpoint not found: {path}'})

        except Exception as e:
            print(f"❌ POST error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def do_PUT(self):
        """Handle PUT requests"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            print(f"📨 PUT request to: {path}")

            # Admin endpoints
            if path.startswith('/api/admin/users/') and path.endswith('/toggle-status'):
                self.handle_admin_toggle_user_status(path)

            # Settings endpoints
            elif path == '/api/settings':
                self.handle_update_settings()

            # Category endpoints
            elif path.startswith('/api/categories/'):
                self.handle_update_category(path)

            # Flashcard endpoints
            elif path.startswith('/api/flashcards/'):
                self.handle_update_flashcard(path)

            else:
                print(f"❌ Endpoint not found: {path}")
                self._send_response(404, {'error': f'Endpoint not found: {path}'})

        except Exception as e:
            print(f"❌ PUT error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def do_DELETE(self):
        """Handle DELETE requests"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            print(f"📨 DELETE request to: {path}")

            # Admin endpoints
            if path.startswith('/api/admin/users/'):
                self.handle_admin_delete_user(path)

            # Category endpoints
            elif path.startswith('/api/categories/'):
                self.handle_delete_category(path)

            # Flashcard endpoints
            elif path.startswith('/api/flashcards/'):
                self.handle_delete_flashcard(path)

            else:
                print(f"❌ Endpoint not found: {path}")
                self._send_response(404, {'error': f'Endpoint not found: {path}'})

        except Exception as e:
            print(f"❌ DELETE error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_health_check(self):
        """Health check endpoint for deployment monitoring"""
        try:
            print("🩺 Health check requested")
            # Test database connection
            from database import client
            client.admin.command('ping')
            print("✅ Database connection OK")

            environment = os.getenv('ENVIRONMENT', 'development')

            health_data = {
                'status': 'healthy',
                'environment': environment,
                'timestamp': datetime.utcnow().isoformat(),
                'database': 'connected',
                'version': '1.0.0'
            }

            self._send_response(200, health_data)
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            self._send_response(503, {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            })

    def handle_environment_info(self):
        """Get environment information"""
        try:
            environment = os.getenv('ENVIRONMENT', 'development')
            frontend_url = os.getenv('FRONTEND_URL', 'not set')

            print(f"ℹ️ Environment info requested - ENV: {environment}, FRONTEND_URL: {frontend_url}")

            info = {
                'environment': environment,
                'frontend_url': frontend_url,
                'branch': 'master' if environment == 'production' else 'develop',
                'features': {
                    'ai_generation': True,
                    'exercises': True,
                    'admin_panel': True
                },
                'version': '1.0.0',
                'build_time': datetime.utcnow().isoformat()
            }

            self._send_response(200, info)
        except Exception as e:
            print(f"❌ Environment info error: {e}")
            self._send_response(500, {'error': 'Server error'})

    # ==================== AUTH HANDLERS ====================

    def handle_signup(self):
        """Handle user registration"""
        try:
            print("📝 Signup request received")
            data = self._get_request_body()

            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            full_name = data.get('fullName', '').strip()

            print(f"📝 Signup data - Email: {email}, Name: {full_name}")

            if not email or not password or not full_name:
                print("❌ Missing required fields")
                self._send_response(400, {'error': 'All fields are required'})
                return

            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                print("❌ Invalid email format")
                self._send_response(400, {'error': 'Invalid email format'})
                return

            if len(password) < 6:
                print("❌ Password too short")
                self._send_response(400, {'error': 'Password must be at least 6 characters'})
                return

            existing_user = users_collection.find_one({'email': email})
            if existing_user:
                print("❌ User already exists")
                self._send_response(400, {'error': 'User already exists'})
                return

            print("✅ Creating new user")
            user = User(full_name, email, password, role='user')
            result = users_collection.insert_one(user.to_dict())
            print(f"✅ User created with ID: {result.inserted_id}")

            # Create default settings
            settings = UserSettings(str(result.inserted_id))
            user_settings_collection.insert_one(settings.to_dict())
            print("✅ Default settings created")

            token = create_access_token(result.inserted_id, email, 'user')
            print(f"✅ Token created: {token[:20]}...")

            user_response = {
                '_id': str(result.inserted_id),
                'full_name': full_name,
                'email': email,
                'role': 'user',
                'profile_picture': None,
                'created_at': user.created_at.isoformat()
            }

            self._send_response(201, {
                'message': 'User created successfully',
                'user': user_response,
                'token': token
            })

        except Exception as e:
            print(f"❌ Signup error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_login(self):
        """Handle user login"""
        try:
            print("🔐 Login request received")
            data = self._get_request_body()

            email = data.get('email', '').strip().lower()
            password = data.get('password', '')

            print(f"🔐 Login attempt - Email: {email}")

            if not email or not password:
                print("❌ Missing email or password")
                self._send_response(400, {'error': 'Email and password are required'})
                return

            print("🔍 Looking for user in database")
            user_doc = users_collection.find_one({'email': email})

            if not user_doc:
                print("❌ User not found")
                self._send_response(401, {'error': 'Invalid credentials'})
                return

            print(f"✅ User found: {user_doc['full_name']}")

            if not user_doc.get('is_active', True):
                print("❌ Account is deactivated")
                self._send_response(403, {'error': 'Account is deactivated'})
                return

            print("🔒 Verifying password")
            if not User.verify_password(password, user_doc['password']):
                print("❌ Invalid password")
                self._send_response(401, {'error': 'Invalid credentials'})
                return

            print("✅ Password verified, creating token")
            token = create_access_token(
                user_doc['_id'],
                user_doc['email'],
                user_doc['role']
            )
            print(f"✅ Token created: {token[:20]}...")

            user_response = {
                '_id': str(user_doc['_id']),
                'full_name': user_doc['full_name'],
                'email': user_doc['email'],
                'role': user_doc['role'],
                'profile_picture': user_doc.get('profile_picture'),
                'created_at': user_doc.get('created_at').isoformat() if user_doc.get('created_at') else None
            }

            print("✅ Login successful")
            self._send_response(200, {
                'message': 'Login successful',
                'user': user_response,
                'token': token
            })

        except Exception as e:
            print(f"❌ Login error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_check_auth(self):
        """Check if user is authenticated"""
        try:
            print("🔍 Auth check requested")
            token = self._get_token_from_header()

            if not token:
                print("❌ No token provided")
                self._send_response(401, {'error': 'No token provided'})
                return

            user_data = get_user_from_token(token)

            if not user_data:
                print("❌ Invalid token")
                self._send_response(401, {'error': 'Invalid token'})
                return

            print(f"🔍 Looking for user: {user_data['user_id']}")
            user_doc = users_collection.find_one({'_id': ObjectId(user_data['user_id'])})

            if not user_doc:
                print("❌ User not found in database")
                self._send_response(401, {'error': 'User not found'})
                return

            user_response = {
                '_id': str(user_doc['_id']),
                'full_name': user_doc['full_name'],
                'email': user_doc['email'],
                'role': user_doc['role'],
                'profile_picture': user_doc.get('profile_picture'),
                'created_at': user_doc.get('created_at').isoformat() if user_doc.get('created_at') else None
            }

            print("✅ Auth check successful")
            self._send_response(200, user_response)

        except Exception as e:
            print(f"❌ Check auth error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_get_me(self):
        """Get current user info"""
        self.handle_check_auth()

    # ==================== SETTINGS HANDLERS ====================

    def handle_get_settings(self):
        """Get user settings"""
        try:
            print("⚙️ Get settings requested")
            token = self._get_token_from_header()

            if not token:
                self._send_response(401, {'error': 'No token provided'})
                return

            user_data = get_user_from_token(token)

            if not user_data:
                self._send_response(401, {'error': 'Invalid token'})
                return

            settings_doc = user_settings_collection.find_one({'user_id': user_data['user_id']})

            if not settings_doc:
                print("⚙️ Creating default settings")
                default_settings = UserSettings(user_data['user_id'])
                user_settings_collection.insert_one(default_settings.to_dict())
                settings_doc = user_settings_collection.find_one({'user_id': user_data['user_id']})

            settings_response = {
                'language_level': settings_doc.get('language_level', 'beginner'),
                'ai_model': settings_doc.get('ai_model', 'gpt-3.5'),
                'voice_enabled': settings_doc.get('voice_enabled', True),
                'notifications_enabled': settings_doc.get('notifications_enabled', True)
            }

            print("✅ Settings retrieved")
            self._send_response(200, settings_response)

        except Exception as e:
            print(f"❌ Get settings error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_update_settings(self):
        """Update user settings"""
        try:
            print("⚙️ Update settings requested")
            token = self._get_token_from_header()

            if not token:
                self._send_response(401, {'error': 'No token provided'})
                return

            user_data = get_user_from_token(token)

            if not user_data:
                self._send_response(401, {'error': 'Invalid token'})
                return

            data = self._get_request_body()

            language_level = data.get('language_level', 'beginner')
            ai_model = data.get('ai_model', 'gpt-3.5')
            voice_enabled = data.get('voice_enabled', True)
            notifications_enabled = data.get('notifications_enabled', True)

            if language_level not in ['beginner', 'intermediate', 'advanced']:
                self._send_response(400, {'error': 'Invalid language level'})
                return

            if ai_model not in ['gpt-3.5', 'gpt-4']:
                self._send_response(400, {'error': 'Invalid AI model'})
                return

            user_settings_collection.update_one(
                {'user_id': user_data['user_id']},
                {
                    '$set': {
                        'language_level': language_level,
                        'ai_model': ai_model,
                        'voice_enabled': voice_enabled,
                        'notifications_enabled': notifications_enabled,
                        'updated_at': datetime.utcnow()
                    }
                },
                upsert=True
            )

            print("✅ Settings updated")
            self._send_response(200, {
                'message': 'Settings updated successfully',
                'settings': {
                    'language_level': language_level,
                    'ai_model': ai_model,
                    'voice_enabled': voice_enabled,
                    'notifications_enabled': notifications_enabled
                }
            })

        except Exception as e:
            print(f"❌ Update settings error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    # ==================== CATEGORY HANDLERS ====================

    def handle_create_category(self):
        """Create new category"""
        try:
            print("📁 Create category requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            data = self._get_request_body()

            name = data.get('name', '').strip()
            description = data.get('description', '').strip()
            color = data.get('color', '#3B82F6')

            if not name:
                self._send_response(400, {'error': 'Category name is required'})
                return

            existing = categories_collection.find_one({
                'user_id': user_data['user_id'],
                'name': name
            })

            if existing:
                self._send_response(400, {'error': 'Category with this name already exists'})
                return

            category = Category(user_data['user_id'], name, description, color)
            result = categories_collection.insert_one(category.to_dict())

            category_response = {
                '_id': str(result.inserted_id),
                'name': name,
                'description': description,
                'color': color,
                'flashcard_count': 0,
                'created_at': category.created_at.isoformat()
            }

            print("✅ Category created")
            self._send_response(201, {
                'message': 'Category created successfully',
                'category': category_response
            })

        except Exception as e:
            print(f"❌ Create category error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_get_categories(self):
        """Get all categories for current user (including default categories)"""
        try:
            print("📁 Get categories requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            user_categories = list(categories_collection.find({'user_id': user_data['user_id']}))
            default_categories = list(categories_collection.find({'is_default': True}))

            all_categories = default_categories + user_categories

            categories_response = []
            for cat in all_categories:
                flashcard_count = flashcards_collection.count_documents({
                    'category_id': str(cat['_id'])
                })

                categories_response.append({
                    '_id': str(cat['_id']),
                    'name': cat['name'],
                    'description': cat.get('description', ''),
                    'color': cat.get('color', '#3B82F6'),
                    'flashcard_count': flashcard_count,
                    'is_default': cat.get('is_default', False),
                    'created_at': cat['created_at'].isoformat()
                })

            print(f"✅ Retrieved {len(categories_response)} categories")
            self._send_response(200, {
                'categories': categories_response,
                'total': len(categories_response)
            })

        except Exception as e:
            print(f"❌ Get categories error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_update_category(self, path):
        """Update category"""
        try:
            print("📁 Update category requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            category_id = path.split('/')[3]
            data = self._get_request_body()

            category = categories_collection.find_one({
                '_id': ObjectId(category_id),
                'user_id': user_data['user_id']
            })

            if not category:
                self._send_response(404, {'error': 'Category not found'})
                return

            if category.get('is_default', False):
                self._send_response(403, {'error': 'Cannot edit default category'})
                return

            name = data.get('name', '').strip()
            description = data.get('description', '').strip()
            color = data.get('color', '#3B82F6')

            if not name:
                self._send_response(400, {'error': 'Category name is required'})
                return

            existing = categories_collection.find_one({
                'user_id': user_data['user_id'],
                'name': name,
                '_id': {'$ne': ObjectId(category_id)}
            })

            if existing:
                self._send_response(400, {'error': 'Category with this name already exists'})
                return

            categories_collection.update_one(
                {'_id': ObjectId(category_id)},
                {
                    '$set': {
                        'name': name,
                        'description': description,
                        'color': color,
                        'updated_at': datetime.utcnow()
                    }
                }
            )

            print("✅ Category updated")
            self._send_response(200, {
                'message': 'Category updated successfully',
                'category': {
                    '_id': category_id,
                    'name': name,
                    'description': description,
                    'color': color
                }
            })

        except Exception as e:
            print(f"❌ Update category error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_delete_category(self, path):
        """Delete category and all its flashcards"""
        try:
            print("📁 Delete category requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            category_id = path.split('/')[3]

            category = categories_collection.find_one({
                '_id': ObjectId(category_id),
                'user_id': user_data['user_id']
            })

            if not category:
                self._send_response(404, {'error': 'Category not found'})
                return

            if category.get('is_default', False):
                self._send_response(403, {'error': 'Cannot delete default category'})
                return

            flashcards_collection.delete_many({'category_id': category_id})
            categories_collection.delete_one({'_id': ObjectId(category_id)})

            print("✅ Category deleted")
            self._send_response(200, {'message': 'Category deleted successfully'})

        except Exception as e:
            print(f"❌ Delete category error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    # ==================== FLASHCARD HANDLERS ====================

    def handle_generate_flashcard(self):
        """Generate complete flashcard using AI"""
        try:
            print("🃏 Generate flashcard requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            data = self._get_request_body()
            word = data.get('word', '').strip()
            category_id = data.get('category_id', '').strip()

            if not word or not category_id:
                self._send_response(400, {'error': 'Word and category are required'})
                return

            category = categories_collection.find_one({
                '_id': ObjectId(category_id),
                'user_id': user_data['user_id']
            })

            if not category:
                self._send_response(404, {'error': 'Category not found'})
                return

            settings_doc = user_settings_collection.find_one({'user_id': user_data['user_id']})
            english_level = settings_doc.get('language_level', 'intermediate') if settings_doc else 'intermediate'

            print(f"🤖 Generating flashcard for: {word} (level: {english_level})")
            result = generate_complete_flashcard(word, english_level)

            if not result["success"]:
                print(f"❌ AI generation failed: {result.get('error')}")
                self._send_response(500, {'error': f'AI generation failed: {result.get("error", "Unknown error")}'})
                return

            ai_data = result["data"]
            print(f"✅ AI data received: {ai_data.get('text', word)}")

            flashcard = Flashcard(
                user_data['user_id'],
                category_id,
                ai_data.get('text', word),
                ai_data.get('translation', ''),
                ai_data.get('examples', [''])[0] if ai_data.get('examples') else '',
                ai_data.get('explanation', ''),
                'medium'
            )

            flashcard_dict = flashcard.to_dict()
            flashcard_dict['transcription'] = ai_data.get('transcription', '')
            flashcard_dict['short_description'] = ai_data.get('short_description', '')
            flashcard_dict['examples'] = ai_data.get('examples', [])
            flashcard_dict['notes'] = ai_data.get('notes', '')

            db_result = flashcards_collection.insert_one(flashcard_dict)
            print(f"✅ Flashcard saved to database: {db_result.inserted_id}")

            flashcard_response = {
                '_id': str(db_result.inserted_id),
                'category_id': category_id,
                'word': flashcard_dict['word'],
                'translation': flashcard_dict['translation'],
                'transcription': flashcard_dict.get('transcription', ''),
                'short_description': flashcard_dict.get('short_description', ''),
                'example': flashcard_dict.get('example', ''),
                'examples': flashcard_dict.get('examples', []),
                'explanation': flashcard_dict.get('explanation', ''),
                'notes': flashcard_dict.get('notes', ''),
                'difficulty': flashcard_dict['difficulty'],
                'times_practiced': 0,
                'times_correct': 0,
                'created_at': flashcard.created_at.isoformat()
            }

            print(f"✅ Flashcard generated successfully: {word}")

            self._send_response(201, {
                'message': 'Flashcard generated successfully',
                'flashcard': flashcard_response
            })

        except Exception as e:
            print(f"❌ Generate flashcard error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_create_flashcard(self):
        """Create new flashcard (manual creation)"""
        try:
            print("🃏 Create flashcard requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            data = self._get_request_body()

            category_id = data.get('category_id', '').strip()
            word = data.get('word', '').strip()
            translation = data.get('translation', '').strip()
            example = data.get('example', '').strip()
            explanation = data.get('explanation', '').strip()
            difficulty = data.get('difficulty', 'medium')

            if not category_id or not word or not translation:
                self._send_response(400, {'error': 'Category, word and translation are required'})
                return

            category = categories_collection.find_one({
                '_id': ObjectId(category_id),
                'user_id': user_data['user_id']
            })

            if not category:
                self._send_response(404, {'error': 'Category not found'})
                return

            existing = flashcards_collection.find_one({
                'category_id': category_id,
                'word': word
            })

            if existing:
                self._send_response(400, {'error': 'Flashcard with this word already exists in this category'})
                return

            flashcard = Flashcard(
                user_data['user_id'],
                category_id,
                word,
                translation,
                example,
                explanation,
                difficulty
            )

            result = flashcards_collection.insert_one(flashcard.to_dict())

            flashcard_response = {
                '_id': str(result.inserted_id),
                'category_id': category_id,
                'word': word,
                'translation': translation,
                'example': example,
                'explanation': explanation,
                'difficulty': difficulty,
                'times_practiced': 0,
                'times_correct': 0,
                'created_at': flashcard.created_at.isoformat()
            }

            print("✅ Flashcard created")
            self._send_response(201, {
                'message': 'Flashcard created successfully',
                'flashcard': flashcard_response
            })

        except Exception as e:
            print(f"❌ Create flashcard error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_get_flashcards(self):
        """Get all flashcards for current user"""
        try:
            print("🃏 Get flashcards requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            flashcards = list(flashcards_collection.find({'user_id': user_data['user_id']}))

            flashcards_response = []
            for card in flashcards:
                flashcards_response.append({
                    '_id': str(card['_id']),
                    'category_id': card['category_id'],
                    'word': card['word'],
                    'translation': card['translation'],
                    'transcription': card.get('transcription', ''),
                    'short_description': card.get('short_description', ''),
                    'example': card.get('example', ''),
                    'examples': card.get('examples', []),
                    'explanation': card.get('explanation', ''),
                    'notes': card.get('notes', ''),
                    'difficulty': card.get('difficulty', 'medium'),
                    'times_practiced': card.get('times_practiced', 0),
                    'times_correct': card.get('times_correct', 0),
                    'created_at': card['created_at'].isoformat()
                })

            print(f"✅ Retrieved {len(flashcards_response)} flashcards")
            self._send_response(200, {
                'flashcards': flashcards_response,
                'total': len(flashcards_response)
            })

        except Exception as e:
            print(f"❌ Get flashcards error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_get_flashcards_by_category(self, path):
        """Get all flashcards in specific category"""
        try:
            print("🃏 Get flashcards by category requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            category_id = path.split('/')[3]
            print(f"🃏 Category ID: {category_id}")

            category = categories_collection.find_one({'_id': ObjectId(category_id)})

            if not category:
                self._send_response(404, {'error': 'Category not found'})
                return

            if not category.get('is_default', False) and category.get('user_id') != user_data['user_id']:
                self._send_response(403, {'error': 'Access denied'})
                return

            flashcards = list(flashcards_collection.find({'category_id': category_id}))
            print(f"🃏 Found {len(flashcards)} flashcards")

            flashcards_response = []
            for card in flashcards:
                flashcards_response.append({
                    '_id': str(card['_id']),
                    'category_id': card['category_id'],
                    'word': card['word'],
                    'translation': card['translation'],
                    'transcription': card.get('transcription', ''),
                    'short_description': card.get('short_description', ''),
                    'example': card.get('example', ''),
                    'examples': card.get('examples', []),
                    'explanation': card.get('explanation', ''),
                    'notes': card.get('notes', ''),
                    'difficulty': card.get('difficulty', 'medium'),
                    'times_practiced': card.get('times_practiced', 0),
                    'times_correct': card.get('times_correct', 0),
                    'is_default': card.get('is_default', False),
                    'created_at': card['created_at'].isoformat()
                })

            print("✅ Flashcards retrieved successfully")
            self._send_response(200, {
                'flashcards': flashcards_response,
                'total': len(flashcards_response)
            })

        except Exception as e:
            print(f"❌ Get flashcards by category error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_get_flashcard(self, path):
        """Get single flashcard"""
        try:
            print("🃏 Get single flashcard requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            flashcard_id = path.split('/')[3]

            flashcard = flashcards_collection.find_one({
                '_id': ObjectId(flashcard_id),
                'user_id': user_data['user_id']
            })

            if not flashcard:
                self._send_response(404, {'error': 'Flashcard not found'})
                return

            flashcard_response = {
                '_id': str(flashcard['_id']),
                'category_id': flashcard['category_id'],
                'word': flashcard['word'],
                'translation': flashcard['translation'],
                'transcription': flashcard.get('transcription', ''),
                'short_description': flashcard.get('short_description', ''),
                'example': flashcard.get('example', ''),
                'examples': flashcard.get('examples', []),
                'explanation': flashcard.get('explanation', ''),
                'notes': flashcard.get('notes', ''),
                'difficulty': flashcard.get('difficulty', 'medium'),
                'times_practiced': flashcard.get('times_practiced', 0),
                'times_correct': flashcard.get('times_correct', 0),
                'created_at': flashcard['created_at'].isoformat()
            }

            print("✅ Flashcard retrieved")
            self._send_response(200, flashcard_response)

        except Exception as e:
            print(f"❌ Get flashcard error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_update_flashcard(self, path):
        """Update flashcard"""
        try:
            print("🃏 Update flashcard requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            flashcard_id = path.split('/')[3]
            data = self._get_request_body()

            flashcard = flashcards_collection.find_one({
                '_id': ObjectId(flashcard_id),
                'user_id': user_data['user_id']
            })

            if not flashcard:
                self._send_response(404, {'error': 'Flashcard not found'})
                return

            if flashcard.get('is_default', False):
                self._send_response(403, {'error': 'Cannot edit flashcard from default category'})
                return

            word = data.get('word', '').strip()
            translation = data.get('translation', '').strip()
            example = data.get('example', '').strip()
            explanation = data.get('explanation', '').strip()
            difficulty = data.get('difficulty', 'medium')

            if not word or not translation:
                self._send_response(400, {'error': 'Word and translation are required'})
                return

            flashcards_collection.update_one(
                {'_id': ObjectId(flashcard_id)},
                {
                    '$set': {
                        'word': word,
                        'translation': translation,
                        'example': example,
                        'explanation': explanation,
                        'difficulty': difficulty,
                        'updated_at': datetime.utcnow()
                    }
                }
            )

            print("✅ Flashcard updated")
            self._send_response(200, {
                'message': 'Flashcard updated successfully',
                'flashcard': {
                    '_id': flashcard_id,
                    'word': word,
                    'translation': translation,
                    'example': example,
                    'explanation': explanation,
                    'difficulty': difficulty
                }
            })

        except Exception as e:
            print(f"❌ Update flashcard error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_delete_flashcard(self, path):
        """Delete flashcard"""
        try:
            print("🃏 Delete flashcard requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            flashcard_id = path.split('/')[3]

            flashcard = flashcards_collection.find_one({
                '_id': ObjectId(flashcard_id),
                'user_id': user_data['user_id']
            })

            if not flashcard:
                self._send_response(404, {'error': 'Flashcard not found'})
                return

            if flashcard.get('is_default', False):
                self._send_response(403, {'error': 'Cannot delete flashcard from default category'})
                return

            flashcards_collection.delete_one({'_id': ObjectId(flashcard_id)})

            print("✅ Flashcard deleted")
            self._send_response(200, {'message': 'Flashcard deleted successfully'})

        except Exception as e:
            print(f"❌ Delete flashcard error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    # ==================== ADMIN HANDLERS ====================

    def handle_admin_create_user(self):
        """Admin: Create new user"""
        try:
            print("👑 Admin create user requested")
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

            print("✅ Admin created user")
            self._send_response(201, {
                'message': 'User created successfully',
                'user': user_response
            })

        except Exception as e:
            print(f"❌ Admin create user error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_admin_get_users(self):
        """Admin: Get all users"""
        try:
            print("👑 Admin get users requested")
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

            print(f"✅ Retrieved {len(users_response)} users")
            self._send_response(200, {
                'users': users_response,
                'total': len(users_response)
            })

        except Exception as e:
            print(f"❌ Admin get users error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_admin_toggle_user_status(self, path):
        """Admin: Toggle user status"""
        try:
            print("👑 Admin toggle user status requested")
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

            print("✅ User status toggled")
            self._send_response(200, {
                'message': f"User {'activated' if new_status else 'deactivated'} successfully",
                'is_active': new_status
            })

        except Exception as e:
            print(f"❌ Admin toggle status error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_admin_delete_user(self, path):
        """Admin: Delete user"""
        try:
            print("👑 Admin delete user requested")
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

            print("✅ User deleted")
            self._send_response(200, {
                'message': 'User deleted successfully'
            })

        except Exception as e:
            print(f"❌ Admin delete user error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    # ==================== AI HANDLERS ====================

    def handle_ai_generate_examples(self):
        """Generate examples for a word using AI"""
        try:
            print("🤖 AI generate examples requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            data = self._get_request_body()
            word = data.get('word', '').strip()

            if not word:
                self._send_response(400, {'error': 'Word is required'})
                return

            settings_doc = user_settings_collection.find_one({'user_id': user_data['user_id']})
            english_level = settings_doc.get('language_level', 'intermediate') if settings_doc else 'intermediate'

            print(f"🤖 Generating examples for: {word}")
            result = generate_examples(word, english_level)

            if not result["success"]:
                print(f"❌ AI generation failed: {result.get('error')}")
                self._send_response(500, {'error': f'AI generation failed: {result.get("error", "Unknown error")}'})
                return

            print(f"✅ Examples generated: {result['data']}")

            self._send_response(200, {
                'examples': result["data"]
            })

        except Exception as e:
            print(f"❌ AI generate examples error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_ai_regenerate_examples(self):
        """Regenerate examples with more variety"""
        try:
            print("🤖 AI regenerate examples requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            data = self._get_request_body()
            word = data.get('word', '').strip()

            if not word:
                self._send_response(400, {'error': 'Word is required'})
                return

            settings_doc = user_settings_collection.find_one({'user_id': user_data['user_id']})
            english_level = settings_doc.get('language_level', 'intermediate') if settings_doc else 'intermediate'

            print(f"🤖 Regenerating examples for: {word}")
            result = regenerate_examples(word, english_level)

            if not result["success"]:
                print(f"❌ AI generation failed: {result.get('error')}")
                self._send_response(500, {'error': f'AI generation failed: {result.get("error", "Unknown error")}'})
                return

            print(f"✅ Examples regenerated: {result['data']}")

            self._send_response(200, {
                'examples': result["data"]
            })

        except Exception as e:
            print(f"❌ AI regenerate examples error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_ai_translate(self):
        """Translate English word to Ukrainian"""
        try:
            print("🤖 AI translate requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            data = self._get_request_body()
            text = data.get('text', '').strip()

            if not text:
                self._send_response(400, {'error': 'Text is required'})
                return

            print(f"🤖 Translating: {text}")
            result = translate_to_ukrainian(text)

            if not result["success"]:
                print(f"❌ Translation failed: {result.get('error')}")
                self._send_response(500, {'error': f'Translation failed: {result.get("error", "Unknown error")}'})
                return

            print(f"✅ Translation: {result['data']}")

            self._send_response(200, {
                'translation': result["data"]
            })

        except Exception as e:
            print(f"❌ AI translate error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})

    def handle_ai_translate_sentence(self):
        """Translate English sentence to Ukrainian"""
        try:
            print("🤖 AI translate sentence requested")
            user_data = self._get_user_from_request()
            if not user_data:
                self._send_response(401, {'error': 'Unauthorized'})
                return

            data = self._get_request_body()
            text = data.get('text', '').strip()

            if not text:
                self._send_response(400, {'error': 'Text is required'})
                return

            print(f"🤖 Translating sentence: {text}")
            result = translate_sentence_to_ukrainian(text)

            if not result["success"]:
                print(f"❌ Translation failed: {result.get('error')}")
                self._send_response(500, {'error': f'Translation failed: {result.get("error", "Unknown error")}'})
                return

            print(f"✅ Translation: {result['data']}")

            self._send_response(200, {
                'translation': result["data"]
            })

        except Exception as e:
            print(f"❌ AI translate sentence error: {e}")
            print(traceback.format_exc())
            self._send_response(500, {'error': f'Server error: {str(e)}'})


def run_server():
    """Start multithreaded HTTP server"""
    port = int(os.getenv('PORT', 5001))
    environment = os.getenv('ENVIRONMENT', 'development')
    frontend_url = os.getenv('FRONTEND_URL', 'not set')

    server_address = ('0.0.0.0', port)
    httpd = ThreadingHTTPServer(server_address, FlashEngHandler)

    print(f'✅ FlashEng Server starting...')
    print(f'🌍 Environment: {environment}')
    print(f'🌐 Frontend URL: {frontend_url}')
    print(f'🚀 Server running on http://0.0.0.0:{port}')
    print(f'📊 Active threads: {threading.active_count()}')

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n🛑 Server stopped')
        httpd.server_close()


if __name__ == '__main__':
    run_server()