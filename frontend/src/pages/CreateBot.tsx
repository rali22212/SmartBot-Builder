import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, Sparkles, FileUp, Settings2, Building2, Users2, PackageSearch, Wrench, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import SparkleLoader from "@/components/ui/sparkle-loader";

import { getAuthHeader } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config";

const CreateBot = () => {
  // Common fields
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mode
  const [mode, setMode] = useState<"automatic" | "manual">("automatic");

  // Automatic mode
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Manual mode fields
  const [orgName, setOrgName] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgAbout, setOrgAbout] = useState("");
  const [employees, setEmployees] = useState<Array<{ name: string; role: string }>>([]);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [products, setProducts] = useState<Array<{ name: string; details: string }>>([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDetails, setNewProductDetails] = useState("");
  const [services, setServices] = useState<Array<{ name: string; details: string }>>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDetails, setNewServiceDetails] = useState("");

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    if (file && validTypes.includes(file.type)) {
      setPdfFile(file);
    } else if (file) {
      toast.error("Please select a PDF or DOCX file");
    }
  };

  const addEmployee = () => {
    if (!newEmpName.trim() || !newEmpRole.trim()) {
      toast.error("Employee name and role are required");
      return;
    }
    setEmployees((prev) => [...prev, { name: newEmpName.trim(), role: newEmpRole.trim() }]);
    setNewEmpName("");
    setNewEmpRole("");
  };

  const removeEmployee = (index: number) => {
    setEmployees((prev) => prev.filter((_, i) => i !== index));
  };

  const addProduct = () => {
    if (!newProductName.trim() || !newProductDetails.trim()) {
      toast.error("Product name and details are required");
      return;
    }
    setProducts((prev) => [...prev, { name: newProductName.trim(), details: newProductDetails.trim() }]);
    setNewProductName("");
    setNewProductDetails("");
  };

  const removeProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const addService = () => {
    if (!newServiceName.trim() || !newServiceDetails.trim()) {
      toast.error("Service name and details are required");
      return;
    }
    setServices((prev) => [...prev, { name: newServiceName.trim(), details: newServiceDetails.trim() }]);
    setNewServiceName("");
    setNewServiceDetails("");
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!botName.trim() || !botDescription.trim()) {
      toast.error("Please provide Chatbot Name and Description");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("mode", mode);
      formData.append("botName", botName.trim());
      formData.append("botDescription", botDescription.trim());

      if (mode === "automatic") {
        if (!pdfFile) {
          toast.error("Please upload a PDF file for Automatic mode");
          return;
        }
        formData.append("pdfFile", pdfFile);
      } else {
        if (!orgName.trim()) {
          toast.error("Organization name is required in Manual mode");
          return;
        }
        if (products.length === 0 && services.length === 0) {
          toast.error("Please add at least one product or one service");
          return;
        }

        formData.append("orgName", orgName.trim());
        formData.append("orgWebsite", orgWebsite.trim());
        formData.append("orgIndustry", orgIndustry.trim());
        formData.append("orgAbout", orgAbout.trim());
        formData.append("employees", JSON.stringify(employees));
        formData.append("products", JSON.stringify(products));
        formData.append("services", JSON.stringify(services));
      }

      const response = await fetch(`${API_BASE_URL}/create-bot`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // If token expired or invalid, redirect to login
        if (response.status === 401) {
          localStorage.removeItem('smartbot_token');
          localStorage.removeItem('smartbot_user');
          toast.error("Session expired", { description: "Please login again" });
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
          return;
        }
        throw new Error(result.error || "Failed to create chatbot");
      }

      toast.success("Chatbot created successfully!", {
        description: `${result.name} is ready to chat`,
      });

      setBotName("");
      setBotDescription("");
      setPdfFile(null);
      setOrgName("");
      setOrgWebsite("");
      setOrgIndustry("");
      setOrgAbout("");
      setEmployees([]);
      setProducts([]);
      setServices([]);

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (error: any) {
      console.error("Error creating chatbot:", error);
      toast.error("Failed to create chatbot", {
        description: error.message,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Hero/Intro */}
        <div className="mb-8 animate-fade-in">
          <Link to="/">
            <Button variant="ghost" className="gap-2 mb-6 hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-10 w-10 text-accent" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Create a New Chatbot
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              You can provide your organization's details by uploading a PDF or pasting text that includes your organization info, services, products, and employees.
              Or, set everything up manually using our guided forms.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
          {/* Common fields */}
          <Card className="bg-glass-bg backdrop-blur-md border-glass-border shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" /> Common Details
              </CardTitle>
              <CardDescription>These are required in both modes</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bot-name">Chatbot Name *</Label>
                <Input id="bot-name" value={botName} onChange={(e) => setBotName(e.target.value)} required placeholder="e.g., Customer Support Bot" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bot-desc">Description *</Label>
                <Textarea id="bot-desc" value={botDescription} onChange={(e) => setBotDescription(e.target.value)} required placeholder="Describe your chatbot's purpose" className="min-h-[100px]" />
              </div>
            </CardContent>
          </Card>

          {/* Mode selection */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="automatic" className="flex items-center gap-2">
                <FileUp className="h-4 w-4" /> Automatic
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Manual
              </TabsTrigger>
            </TabsList>

            {/* Automatic mode */}
            <TabsContent value="automatic" className="mt-6">
              <Card className="bg-glass-bg backdrop-blur-md border-glass-border shadow-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-primary" /> Upload PDF
                  </CardTitle>
                  <CardDescription>Provide a PDF containing your organization details (name, products, services, etc.)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Label htmlFor="pdf">Organization Info (PDF or DOCX) *</Label>
                  <div className="relative group cursor-pointer">
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                      onChange={handlePdfChange}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 rounded-lg p-8 text-center transition-all duration-300 md:group-active:scale-[0.99]">
                      <FileUp className="h-10 w-10 mx-auto text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300 mb-3" />
                      <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  </div>
                  {pdfFile && (
                    <p className="text-sm text-muted-foreground">Selected: {pdfFile.name}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manual mode */}
            <TabsContent value="manual" className="mt-6 space-y-6">
              {/* Organization */}
              <Card className="bg-glass-bg backdrop-blur-md border-glass-border shadow-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> Organization Details
                  </CardTitle>
                  <CardDescription>Provide basic information about your organization</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="org-name">Organization Name *</Label>
                    <Input id="org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g., Acme Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-website">Website</Label>
                    <Input id="org-website" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder="https://example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-industry">Industry</Label>
                    <Input id="org-industry" value={orgIndustry} onChange={(e) => setOrgIndustry(e.target.value)} placeholder="e.g., E‑commerce" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="org-about">About</Label>
                    <Textarea id="org-about" value={orgAbout} onChange={(e) => setOrgAbout(e.target.value)} placeholder="Short description of your organization" className="min-h-[100px]" />
                  </div>
                </CardContent>
              </Card>

              {/* Employees */}
              <Card className="bg-glass-bg backdrop-blur-md border-glass-border shadow-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users2 className="h-5 w-5 text-accent" /> Employee Details
                  </CardTitle>
                  <CardDescription>Add key employees so your bot can reference them</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="emp-name">Name</Label>
                      <Input id="emp-name" value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="emp-role">Role</Label>
                      <Input id="emp-role" value={newEmpRole} onChange={(e) => setNewEmpRole(e.target.value)} placeholder="Support Lead" />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={addEmployee} className="w-full md:w-auto">Add Employee</Button>
                    </div>
                  </div>
                  {employees.length > 0 && (
                    <ul className="space-y-2">
                      {employees.map((emp, idx) => (
                        <li key={idx} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
                          <span className="text-sm text-foreground">{emp.name} — <span className="text-muted-foreground">{emp.role}</span></span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeEmployee(idx)}>Remove</Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Products and Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-glass-bg backdrop-blur-md border-glass-border shadow-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PackageSearch className="h-5 w-5 text-primary" /> Products
                    </CardTitle>
                    <CardDescription>List your main products</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input id="product-name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="e.g., Acme Widget" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-details">Details</Label>
                        <Textarea id="product-details" value={newProductDetails} onChange={(e) => setNewProductDetails(e.target.value)} placeholder="Brief description, features, pricing, etc." className="min-h-[90px]" />
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={addProduct}>Add Product</Button>
                      </div>
                    </div>
                    {products.length > 0 && (
                      <ul className="space-y-2">
                        {products.map((p, idx) => (
                          <li key={idx} className="rounded-md border border-border/50 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{p.name}</span>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeProduct(idx)}>Remove</Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{p.details}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-glass-bg backdrop-blur-md border-glass-border shadow-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-accent" /> Services
                    </CardTitle>
                    <CardDescription>List your main services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="service-name">Service Name</Label>
                        <Input id="service-name" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="e.g., Installation" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-details">Details</Label>
                        <Textarea id="service-details" value={newServiceDetails} onChange={(e) => setNewServiceDetails(e.target.value)} placeholder="Scope, SLAs, pricing tiers, etc." className="min-h-[90px]" />
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={addService}>Add Service</Button>
                      </div>
                    </div>
                    {services.length > 0 && (
                      <ul className="space-y-2">
                        {services.map((s, idx) => (
                          <li key={idx} className="rounded-md border border-border/50 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{s.name}</span>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeService(idx)}>Remove</Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{s.details}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-gradient-button hover:shadow-glow gap-2 min-w-[160px] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <SparkleLoader size="sm" text="Deploying Intelligence..." variant="white" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Chatbot
                </>
              )}
            </Button>
          </div>
        </form>


      </main>

      <Footer />
    </div >
  );
};

export default CreateBot;
