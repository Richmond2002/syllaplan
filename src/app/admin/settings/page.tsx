import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-headline font-bold">Platform Settings</h1>
                <p className="text-muted-foreground">Configure global settings for CourseForge.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>General</CardTitle>
                    <CardDescription>Basic platform information and branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <Input id="platform-name" defaultValue="CourseForge" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="platform-logo">Platform Logo</Label>
                        <Input id="platform-logo" type="file" />
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Settings related to user registration and roles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="allow-registration" defaultChecked />
                        <Label htmlFor="allow-registration">Allow public student registration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="require-approval" defaultChecked />
                        <Label htmlFor="require-approval">Require admin approval for new lecturer accounts</Label>
                    </div>
                </CardContent>
            </Card>
            
            <Separator />

            <div className="flex justify-end">
                <Button>Save Changes</Button>
            </div>
        </div>
    );
}
