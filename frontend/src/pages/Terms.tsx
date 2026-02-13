import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Scale, Users, Ban, AlertCircle } from "lucide-react";

const Terms = () => {
    return (
        <div className="min-h-screen bg-gradient-hero">
            <Navbar />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">

                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-muted-foreground">
                            Last Updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <div className="bg-gradient-card backdrop-blur-sm border border-border/50 rounded-2xl p-8 space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <Scale className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing or using SmartBot Builder, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                                    <Users className="h-6 w-6 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">2. User Accounts</h2>
                            </div>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>You generally must register for an account to access key features.</li>
                                <li>You are responsible for maintaining the confidentiality of your account and password.</li>
                                <li>You agree to accept responsibility for all activities that occur under your account.</li>
                                <li>We reserve the right to terminate accounts that violate our policies.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                                    <Ban className="h-6 w-6 text-secondary" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">3. Prohibited Use</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                You may not use the Service to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Violate any laws or regulations.</li>
                                <li>Distribute malware, viruses, or harmful code.</li>
                                <li>Harass, abuse, or harm others.</li>
                                <li>Interfere with the proper operation of the Service.</li>
                                <li>Reverse engineer or attempt to extract source code unless expressly permitted.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <AlertCircle className="h-6 w-6 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">4. Limitation of Liability</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                In no event shall SmartBot Builder, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground">5. Changes to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. if a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
                            </p>
                        </section>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Terms;
