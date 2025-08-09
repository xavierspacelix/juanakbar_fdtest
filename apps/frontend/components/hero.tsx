import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import LogoCloud from "./logo-cloud";
const Hero = () => {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center py-20 px-6">
      <div className="md:mt-6 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <Badge className="bg-primary rounded-full py-1 border-none">
            12 Books is available now! 🚀
          </Badge>
          <h1 className="mt-6 max-w-[20ch] text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold !leading-[1.2] tracking-tight">
            Read Without Limits, Learn Without End
          </h1>
          <p className="mt-6 max-w-[60ch] xs:text-lg">
            Access thousands of digital books uploaded by our community. Read, download, and share
            knowledge easily and for free!
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center sm:justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto rounded-full text-base">
              Explore Library <ArrowUpRight className="!h-5 !w-5" />
            </Button>

          </div>
        </div>
      </div>
      <LogoCloud className="mt-24 max-w-3xl mx-auto" />
    </div>
  );
};

export default Hero;
