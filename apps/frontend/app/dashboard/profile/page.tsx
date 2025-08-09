"use client";
import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, X, User, Mail, Shield, EyeOff, Eye, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUser } from "@/hooks/use-user";
import { getUserInitials } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { login, updateProfile, uploadAvatar } from "@/services/auth.service";
import toast from "react-hot-toast";
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters long.",
    })
    .refine((val) => !val || /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter.",
    })
    .refine((val) => !val || /[0-9]/.test(val), {
      message: "Password must contain at least one number.",
    }),
  confirmPassword: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;
function getPasswordStrength(password: string): { score: number; feedback: string[] } {
  if (!password) return { score: 0, feedback: [] };

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 20;
  } else {
    feedback.push("At least 8 characters");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 20;
  } else {
    feedback.push("One lowercase letter");
  }

  return { score, feedback };
}
function PasswordStrengthIndicator({ password }: { password: string }) {
  const { score, feedback } = getPasswordStrength(password);

  const getStrengthText = (score: number) => {
    if (score === 0) return { text: "", color: "" };
    if (score <= 40) return { text: "Weak", color: "text-red-500" };
    if (score <= 60) return { text: "Fair", color: "text-yellow-500" };
    if (score <= 80) return { text: "Good", color: "text-blue-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const { text, color } = getStrengthText(score);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Password strength</span>
        <span className={`text-sm font-medium ${color}`}>{text}</span>
      </div>
      <Progress value={score} className="h-2" />
      {feedback.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-1">Missing requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            {feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
const Profile = () => {
  const { user } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      ...user,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const watchedValues = form.watch();
  const initials = getUserInitials(watchedValues.name);
  const newPassword = form.watch("newPassword") || "";
  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      if (data.currentPassword) {
        await login(data.email, data.currentPassword).catch((error) => {
          console.log(error.response?.data?.message);
        });
      }
      const res = await updateProfile({
        name: data.name,
        email: data.email,
        password: data.newPassword,
      });
      if (res.success) {
        setIsLoading(false);
        toast.success("Profile updated successfully!");
      }

      if (data.newPassword) {
        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
        form.setValue("confirmPassword", "");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong!");
    }
  }
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      await uploadAvatar(file)
        .then((res) => {
          if (res.success) {
            toast.success("Avatar uploaded successfully!");
          }
        })
        .catch((err) => {
          toast.error("Error uploading avatar!");
        });
      reader.readAsDataURL(file);
    }
  };
  const removeAvatar = async () => {
    setAvatarUrl("");
    await uploadAvatar(null)
      .then((res) => {
        if (res.success) {
          toast.success("Avatar removed successfully!");
        }
      })
      .catch((err) => {
        toast.error("Error removing avatar!");
      });
  };
  return (
    <div className="container w-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and set email preferences.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Picture
                    </CardTitle>
                    <CardDescription>
                      This will be displayed on your profile and in comments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage
                            src={avatarUrl || "/placeholder.svg"}
                            alt="Profile picture"
                          />
                          <AvatarFallback className="text-xl font-semibold text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {avatarUrl && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={removeAvatar}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                              <Camera className="w-4 h-4 mr-2" />
                              Upload Photo
                            </label>
                          </Button>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          JPG, GIF or PNG. Max size of 2MB.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" type="email" {...field} />
                          </FormControl>
                          <FormDescription>
                            This email will be used for account notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Update your password and security preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      For your security, we recommend using a strong password that you don't use
                      elsewhere.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Enter your current password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter your new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        {field.value && <PasswordStrengthIndicator password={field.value} />}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        {field.value && newPassword && field.value === newPassword && (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            Passwords match
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
