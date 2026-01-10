import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/ProfileView";
import { currentUser } from "@clerk/nextjs/server";

export default async function PerfilPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();

  // Serializar dados do Clerk para passar ao componente client
  const serializedClerkUser = clerkUser ? {
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    emailAddresses: clerkUser.emailAddresses.map(e => ({ emailAddress: e.emailAddress })),
    imageUrl: clerkUser.imageUrl,
  } : null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Perfil</h1>
      <ProfileView
        user={user}
        clerkUser={serializedClerkUser}
      />
    </div>
  );
}
