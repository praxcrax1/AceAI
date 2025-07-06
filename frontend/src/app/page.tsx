import { 
  FileText, 
  MessageSquare, 
  Upload, 
  BarChart2, 
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Onboarding } from "@/components/onboarding";

export default function Home() {
  return (
    <div className="space-y-6">
      <Onboarding />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/documents">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Documents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Documents</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 recent uploads</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents" className="flex items-center">
                View all documents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Annual Report uploaded</span>
              <span className="ml-auto text-xs text-muted-foreground">2h ago</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Chat session completed</span>
              <span className="ml-auto text-xs text-muted-foreground">4h ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Chat Sessions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Chat Sessions</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">32 total sessions</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/chat" className="flex items-center">
                View chat history
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* System Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">System Status</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">API: 98% uptime</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
