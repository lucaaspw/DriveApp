import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
