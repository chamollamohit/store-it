import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";
import { Toaster } from "@/components/ui/sonner";

async function Layout({ children }: { children: React.ReactNode }) {
    const currentUser = await getCurrentUser();
    // console.log(currentUser.ownerId);
    if (!currentUser) return redirect("/sign-in");
    return (
        <main className="flex flex-col h-screen">
            <section className="flex h-full flex-1 flex-row">
                <Sidebar
                    fullName={currentUser.fullName}
                    avatar={currentUser.avatar}
                    email={currentUser.email}
                />
                <div className="flex flex-col flex-1">
                    <MobileNavigation
                        avatar={currentUser.avatar}
                        ownerId={currentUser.ownerId}
                        accountId={currentUser.accountId}
                        fullName={currentUser.fullName}
                        email={currentUser.email}
                    />
                    <Header
                        userId={currentUser.$id}
                        accountId={currentUser.accountId}
                    />
                    <div className="main-content remove-scrollbar">
                        {children}
                    </div>
                </div>
            </section>
            <Toaster />
        </main>
    );
}

export default Layout;
