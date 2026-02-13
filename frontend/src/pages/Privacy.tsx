import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const Privacy = () => {
    return (
        <div className="min-h-screen bg-gradient-hero">
            <Navbar />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">

                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground">
                            Last Updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <div className="bg-gradient-card backdrop-blur-sm border border-border/50 rounded-2xl p-8 space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Welcome to SmartBot Builder ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI chatbot building services.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                                    <Eye className="h-6 w-6 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
                            </div>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong className="text-foreground">Personal Information:</strong> We collect your name, email address, and account credentials when you register for an account.</li>
                                <li><strong className="text-foreground">Bot Data:</strong> We store the documents (PDFs, DOCX) and text content you upload to train your chatbots.</li>
                                <li><strong className="text-foreground">Chat Logs:</strong> We maintain logs of conversations between your bots and users to provide analytics and chat history features.</li>
                                <li><strong className="text-foreground">Usage Data:</strong> We collect information about how you interact with our platform to improve our services.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                                    <FileText className="h-6 w-6 text-secondary" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Provide, operate, and maintain our AI chatbot services.</li>
                                <li>Process your transactions and manage your account.</li>
                                <li>Improve, personalize, and expand our platform.</li>
                                <li>Understand and analyze how you use our services.</li>
                                <li>Communicate with you, including for customer service, updates, and marketing.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <Lock className="h-6 w-6 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We implement robust security measures to protect your personal information. We use industry-standard encryption (SSL/TLS) for data transmission and secure database storage. however, please note that no method of transmission over the internet or electronic storage is 100% secure.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground">5. Third-Party Services</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use trusted third-party services to operate our platform, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Neon PostgreSQL:</strong> For secure database hosting.</li>
                                <li><strong>Groq & HuggingFace:</strong> For AI model processing and embeddings.</li>
                                <li><strong>EmailJS:</strong> For transactional emails (OTPs, notifications).</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground">6. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at support@smartbotbuilder.com.
                            </p>
                        </section>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Privacy;
