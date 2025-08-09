"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, register } from "@/services/auth.service";
import { useState } from "react";
import toast from "react-hot-toast";

const loginSchema = z.object({
  name: z.string().min(3, { message: "Name minimal 3 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

type RegisterFormValues = z.infer<typeof loginSchema>;

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError("");
    try {
      const res = register(values.name, values.email, values.password);
      toast
        .promise(res, {
          loading: "Loading...",
          success: "Register success!",
          error: "Check your email and password!",
        })
        .then((res) => {
          if (res.success) {
            router.push("/login");
          }
        });
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Email atau password salah");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Enter your email below to register your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
            <div className="grid gap-3">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>

            {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2Icon className="animate-spin mr-2" />}
                Register
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
