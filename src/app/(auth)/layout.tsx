import Image from "next/image";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen">
            <section className="bg-brand p-10 hidden w-1/2 items-center justify-center lg:flex xl:w-2/5">
                <div className="flex flex-col max-h-[800px] max-w-[430px] justify-center space-y-12">
                    <Image
                        src="/icons/logo-full.svg"
                        alt="log"
                        width={220}
                        height={80}
                    />
                    <div className="space-y-5 text-white">
                        <h1 className="h1">Manage your files the best way</h1>
                        <p className="body-1">
                            This the place where you can store all your
                            documents
                        </p>
                    </div>
                    <Image
                        src="/images/files.png"
                        alt="files"
                        width={342}
                        height={342}
                        className="transition-all hover:rotate-2 hover:scale-105"
                        priority={true}
                    />
                </div>
            </section>
            <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
                <div className="mb-16 lg:hidden">
                    <Image
                        src="/icons/logo-full-brand.svg"
                        alt="logo"
                        width={224}
                        height={82}
                        className="h-auth w-[200px] lg:w-[250px]"
                    />
                </div>
                {children}
            </section>
            <Toaster />
        </div>
    );
};

export default Layout;
