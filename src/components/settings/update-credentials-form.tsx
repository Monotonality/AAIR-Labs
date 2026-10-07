"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

type FieldState = { message: string | null; isError: boolean };

async function updateCredentials(payload: Record<string, string>) {
  const res = await fetch("/api/account/update-credentials", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export function ChangePasswordForm() {
  const [state, setState] = useState<FieldState>({ message: null, isError: false });
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ message: null, isError: false });
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = await updateCredentials({
      action: "password",
      currentPassword: String(formData.get("currentPassword")),
      newPassword: String(formData.get("newPassword")),
    });

    setIsLoading(false);
    if (data.error) {
      setState({ message: data.error, isError: true });
    } else {
      setState({ message: "Password updated.", isError: false });
      e.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {state.message && (
        <Alert variant={state.isError ? "destructive" : "default"}>
          {state.message}
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, setState] = useState<FieldState>({ message: null, isError: false });
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ message: null, isError: false });
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = await updateCredentials({
      action: "email",
      newEmail: String(formData.get("newEmail")),
    });

    setIsLoading(false);
    if (data.error) {
      setState({ message: data.error, isError: true });
    } else {
      setState({ message: "Email updated.", isError: false });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {state.message && (
        <Alert variant={state.isError ? "destructive" : "default"}>
          {state.message}
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="currentEmail">Current email</Label>
        <Input id="currentEmail" value={currentEmail} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newEmail">New email</Label>
        <Input
          id="newEmail"
          name="newEmail"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating…" : "Update email"}
      </Button>
    </form>
  );
}