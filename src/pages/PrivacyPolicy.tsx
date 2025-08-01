import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Lock, Database, Users, FileText } from "lucide-react"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useEffect } from "react"

const PrivacyPolicy = () => {
  const scrollToSection = (sectionId: string) => {
    // For privacy policy, just navigate to home
    window.location.href = '/#' + sectionId
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onScrollToSection={scrollToSection} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This Privacy Policy describes how Stanimeros ("we," "us," or "our") collects, uses, and shares your personal information when you use our mobile applications and services.
              </p>
              <p className="text-muted-foreground">
                By using our apps, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <p className="text-muted-foreground">
                  We may collect personal information such as your name, email address, and device information when you use our apps.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Data</h3>
                <p className="text-muted-foreground">
                  We collect information about how you use our apps, including features accessed, time spent, and performance data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Device Information</h3>
                <p className="text-muted-foreground">
                  We may collect device-specific information such as device model, operating system version, and unique device identifiers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• To provide and maintain our apps and services</li>
                <li>• To improve and personalize your experience</li>
                <li>• To communicate with you about updates and features</li>
                <li>• To analyze usage patterns and optimize performance</li>
                <li>• To ensure security and prevent fraud</li>
                <li>• To comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We do not sell your personal information. Your data is never sold to third parties. We do not share your personal information with any third parties under any circumstances.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Encryption of data in transit and at rest</li>
                <li>• Regular security assessments and updates</li>
                <li>• Access controls and authentication measures</li>
                <li>• Secure data storage practices</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Access your personal information</li>
                <li>• Correct inaccurate information</li>
                <li>• Request deletion of your data</li>
                <li>• Object to processing of your data</li>
                <li>• Data portability</li>
                <li>• Withdraw consent</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our apps are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: <a href="mailto:hello@stanimeros.com" className="text-primary hover:underline">hello@stanimeros.com</a></p>
                <p>Address: Thessaloniki, Greece</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Deletion Link */}
          <div className="text-center">
            <Separator className="my-8" />
            <p className="text-muted-foreground mb-4">
              To request deletion of your data, please visit our data deletion page.
            </p>
            <Link to="/data-deletion">
              <Button>
                Request Data Deletion
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default PrivacyPolicy 