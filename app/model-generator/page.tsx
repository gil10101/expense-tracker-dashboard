"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Download, RefreshCw } from "lucide-react"

export default function ModelGeneratorPage() {
  const [iframeUrl, setIframeUrl] = useState("/model-generator.html")
  
  // Force iframe reload
  const reloadIframe = () => {
    setIframeUrl("")
    setTimeout(() => {
      setIframeUrl("/model-generator.html")
    }, 100)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">3D Model Generator</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={reloadIframe}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Generator
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="generator">Model Generator</TabsTrigger>
          <TabsTrigger value="info">Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator">
          <iframe 
            src={iframeUrl}
            className="w-full min-h-[700px] border rounded-md" 
            title="3D Model Generator"
          />
        </TabsContent>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Instructions for 3D Model Generation</CardTitle>
              <CardDescription>
                Follow these steps to create and use 3D models in your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Step 1: Generate Models</h3>
                <p className="text-muted-foreground">
                  In the Model Generator tab, click the buttons to generate each 3D model type.
                  You can download them to your computer and/or upload them directly to the application.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Step 2: Verify Model Files</h3>
                <p className="text-muted-foreground">
                  Ensure the models are correctly saved in the <code>public/models</code> directory.
                  The required model files are:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground">
                  <li>bar_chart.glb</li>
                  <li>coin_stack.glb</li>
                  <li>credit_card.glb</li>
                  <li>pie_chart.glb</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Step 3: Restart the Application</h3>
                <p className="text-muted-foreground">
                  After generating the models, restart your Next.js application to ensure the new assets are properly loaded.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 