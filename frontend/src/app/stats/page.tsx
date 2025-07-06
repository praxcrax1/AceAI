import { BarChart2, PieChart, LineChart, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Tabs defaultValue="7d" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
            <TabsTrigger value="90d">90d</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileStatIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <ChatStatIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageStatIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <ClockStatIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4s</div>
            <p className="text-xs text-muted-foreground">-0.3s from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Documents By Type</CardTitle>
            <CardDescription>Distribution of document types processed</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <PieChartPlaceholder />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
            <CardDescription>Chat sessions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartPlaceholder />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Active Documents</CardTitle>
          <CardDescription>Documents with the most chat interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartPlaceholder />
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components for charts
// In a real application, you would use a chart library like recharts

function FileStatIcon(props: React.SVGProps<SVGSVGElement>) {
  return <BarChart2 {...props} />;
}

function ChatStatIcon(props: React.SVGProps<SVGSVGElement>) {
  return <BarChart2 {...props} />;
}

function MessageStatIcon(props: React.SVGProps<SVGSVGElement>) {
  return <LineChart {...props} />;
}

function ClockStatIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Calendar {...props} />;
}

function PieChartPlaceholder() {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
      <div className="flex flex-col items-center text-center">
        <PieChart className="h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Pie chart visualization would appear here
        </p>
        <p className="text-xs text-muted-foreground">
          (Using a chart library like Recharts)
        </p>
      </div>
    </div>
  );
}

function LineChartPlaceholder() {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
      <div className="flex flex-col items-center text-center">
        <LineChart className="h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Line chart visualization would appear here
        </p>
        <p className="text-xs text-muted-foreground">
          (Using a chart library like Recharts)
        </p>
      </div>
    </div>
  );
}

function BarChartPlaceholder() {
  return (
    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
      <div className="flex flex-col items-center text-center">
        <BarChart2 className="h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Bar chart visualization would appear here
        </p>
        <p className="text-xs text-muted-foreground">
          (Using a chart library like Recharts)
        </p>
      </div>
    </div>
  );
}
