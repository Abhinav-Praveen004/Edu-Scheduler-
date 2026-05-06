'use client'

import { TimetableGenerator } from "@/components/timetable-generator";
import { getUserData, StudentData } from "@/lib/demo-data";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function TimetablePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [userData, setUserData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) { router.push('/'); return; }
        getUserData(userId).then(data => {
            if (!data || data.role !== 'student') router.push('/');
            else setUserData(data as StudentData);
            setLoading(false);
        });
    }, [userId, router]);

    if (loading) return <div className="flex h-screen w-full items-center justify-center"><Loader className="h-8 w-8 animate-spin text-purple-600" /></div>;
    if (!userData) return null;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-16">
                <header className="py-6">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </header>
                <TimetableGenerator userData={userData} />
            </div>
        </main>
    );
}

export default function TimetablePage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader className="h-8 w-8 animate-spin text-purple-600" /></div>}>
            <TimetablePageContent />
        </Suspense>
    );
}
