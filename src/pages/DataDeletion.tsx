import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle, Mail, Shield, Clock } from "lucide-react"

const DataDeletion = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    appName: "",
    userId: "",
    reason: "",
    additionalInfo: ""
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [verifyChecked, setVerifyChecked] = useState(false)
  const [selectedApps, setSelectedApps] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAppSelection = (appName: string) => {
    setSelectedApps(prev => {
      if (prev.includes(appName)) {
        return prev.filter(app => app !== appName)
      } else {
        return [...prev, appName]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    setIsSubmitted(true)
  }

  const apps = [
    { name: "TaskMaster Pro", id: "taskmaster-pro" },
    { name: "FitnessTracker", id: "fitness-tracker" },
    { name: "BudgetPlanner", id: "budget-planner" },
    { name: "StudyBuddy", id: "study-buddy" }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold">
                Stanimeros
              </Link>
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Success Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Request Submitted Successfully</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your data deletion request. We have received your submission and will process it within 30 days as required by data protection regulations.
            </p>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Clock className="h-5 w-5 mr-2" />
                  What Happens Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground text-left">
                    We will review your request and verify your identity within 3-5 business days.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground text-left">
                    You will receive a confirmation email with a reference number for tracking.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground text-left">
                    Your data will be permanently deleted within 30 days of verification.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground text-left">
                    You will receive a final confirmation email once deletion is complete.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Link to="/">
                <Button>
                  Return to Home
                </Button>
              </Link>
              <div>
                <p className="text-sm text-muted-foreground">
                  Need help? Contact us at{" "}
                  <a href="mailto:privacy@stanimeros.com" className="text-primary hover:underline">
                    privacy@stanimeros.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
              Stanimeros
            </Link>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Trash2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Request Data Deletion</h1>
            <p className="text-muted-foreground">
              Submit a request to delete your personal data from our applications
            </p>
          </div>

          {/* Important Notice */}
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-orange-700 dark:text-orange-300">
                <li>• Data deletion is permanent and cannot be undone</li>
                <li>• You will lose access to your account and all associated data</li>
                <li>• This process may take up to 30 days to complete</li>
                <li>• We may need to verify your identity before processing</li>
              </ul>
            </CardContent>
          </Card>

          {/* Available Apps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select the application(s) from which you want to delete your data:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {apps.map((app) => (
                  <Badge 
                    key={app.id} 
                    variant={selectedApps.includes(app.name) ? "default" : "outline"}
                    className={`justify-center py-2 cursor-pointer transition-colors ${
                      selectedApps.includes(app.name) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => handleAppSelection(app.name)}
                  >
                    {app.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deletion Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Data Deletion Request Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name *</Label>
                    <Input
                      id="appName"
                      name="appName"
                      value={formData.appName}
                      onChange={handleInputChange}
                      placeholder="e.g., TaskMaster Pro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID (Optional)</Label>
                    <Input
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      placeholder="Your user ID if known"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Deletion *</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Please explain why you want to delete your data..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Any additional details that might help us process your request..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="confirm"
                      checked={confirmChecked}
                      onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
                      required
                    />
                    <Label htmlFor="confirm" className="text-sm cursor-pointer">
                      I understand that this action is permanent and cannot be undone. I confirm that I want to delete all my personal data from the specified application.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="verify"
                      checked={verifyChecked}
                      onCheckedChange={(checked) => setVerifyChecked(checked as boolean)}
                      required
                    />
                    <Label htmlFor="verify" className="text-sm cursor-pointer">
                      I confirm that I am the rightful owner of this account and have the authority to request data deletion.
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !confirmChecked || !verifyChecked}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Submit Deletion Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="text-center mt-8">
            <Separator className="my-8" />
            <p className="text-muted-foreground mb-4">
              Need help or have questions about data deletion?
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:privacy@stanimeros.com" className="text-primary hover:underline">
                privacy@stanimeros.com
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card py-8 border-t mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground">
              © 2024 Stanimeros. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DataDeletion 