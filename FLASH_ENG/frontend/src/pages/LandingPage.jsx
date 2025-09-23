// src/pages/LandingPage.jsx
import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Brain, BarChart3, Volume2, Heart, Settings, CheckCircle, Play } from 'lucide-react';

const LandingPage = () => {
    const [isVisible, setIsVisible] = useState({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    setIsVisible(prev => ({
                        ...prev,
                        [entry.target.id]: entry.isIntersecting
                    }));
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('[id]').forEach(el => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-8">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">F</span>
                            </div>
                            <span className="text-2xl font-bold">FlashEng</span>
                        </div>
                        <a
                            href="/signup"
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
                        >
                            Почати зараз
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-green-900/20"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
                Практикуйте англійську
              </span>
                            <span className="block">з силою ШІ</span>
                        </h1>
                    </div>

                    <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Персоналізовані флеш-картки, інтерактивні вправи та динамічний контент, створений штучним інтелектом спеціально для вас
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <a
                            href="/signup"
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center space-x-2"
                        >
                            <span>Розпочати безкоштовно</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-3xl font-bold text-blue-400 mb-2">10,000+</div>
                            <div className="text-gray-300">Активних користувачів</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-3xl font-bold text-purple-400 mb-2">50,000+</div>
                            <div className="text-gray-300">Вивчених слів</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
                            <div className="text-gray-300">Задоволених користувачів</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-30 bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Потужні функції для ефективного навчання
              </span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Все що потрібно для успішного вивчення англійської мови в одному місці
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {[
                            {
                                icon: BookOpen,
                                title: "Розумні флеш-картки",
                                description: "Створюйте та налаштовуйте персональні флеш-картки з перекладом, прикладами та аудіо",
                                color: "from-blue-500 to-blue-600"
                            },
                            {
                                icon: Brain,
                                title: "ШІ-генерація вправ",
                                description: "Штучний інтелект створює унікальні та персоналізовані завдання на основі ваших карток",
                                color: "from-purple-500 to-purple-600"
                            },
                            {
                                icon: BarChart3,
                                title: "Відстеження прогресу",
                                description: "Детальна статистика та аналітика вашого навчального процесу",
                                color: "from-green-500 to-green-600"
                            },
                            {
                                icon: Settings,
                                title: "Персоналізація",
                                description: "Налаштування під ваш рівень знань та індивідуальні потреби навчання",
                                color: "from-indigo-500 to-indigo-600"
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-gray-300">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="py-30 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Чому обирають FlashEng?
              </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            {[
                                {
                                    title: "Швидке засвоєння",
                                    description: "Наукові методи spaced repetition допомагають запам'ятати слова назавжди",
                                    color: "bg-green-500"
                                },
                                {
                                    title: "Адаптивність",
                                    description: "Система підлаштовується під ваш темп навчання та рівень знань",
                                    color: "bg-blue-500"
                                },
                                {
                                    title: "Мотивація",
                                    description: "Ігрові елементи та досягнення роблять навчання захоплюючим",
                                    color: "bg-purple-500"
                                }
                            ].map((benefit, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className={`flex-shrink-0 w-12 h-12 ${benefit.color} rounded-xl flex items-center justify-center`}>
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{benefit.title}</h3>
                                        <p className="text-gray-300">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-center">
                                    <h4 className="text-2xl font-bold mb-4">Результати за місяць:</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span>Нових слів:</span>
                                            <span className="font-bold">500+</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Точність:</span>
                                            <span className="font-bold">92%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Час навчання:</span>
                                            <span className="font-bold">15 хв/день</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-30 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Готові почати свою подорож до вільного володіння англійською?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Приєднуйтесь до тисяч користувачів, які вже досягли успіху з FlashEng
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/signup"
                            className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        >
                            Розпочати безкоштовно
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Links */}
                        <div>
                            <h4 className="text-white text-xl font-bold mb-4">Посилання</h4>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li><a href="/" className="hover:text-white transition-colors">Головна</a></li>
                                <li><a href="/signup" className="hover:text-white transition-colors">Реєстрація</a></li>
                                <li><a href="/login" className="hover:text-white transition-colors">Вхід</a></li>
                                <li><a href="/settings" className="hover:text-white transition-colors">Налаштування</a></li>
                                <li><a href="/profile" className="hover:text-white transition-colors">Профіль</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white text-xl font-bold mb-4">Контакти</h4>
                            <p className="text-gray-400 text-sm mb-2">Email: <a href="mailto:support@flasheng.com" className="hover:text-white">support@flasheng.com</a></p>
                            <p className="text-gray-400 text-sm mb-2">Телефон: <a href="tel:+380501234567" className="hover:text-white">+380 50 123 45 67</a></p>
                            <div className="flex space-x-4 mt-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-500 text-sm">
                        &copy; 2025 FlashEng. Всі права захищено.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;