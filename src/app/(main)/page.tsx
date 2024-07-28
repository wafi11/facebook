import TrendsSidebar from "@/components/sidebar/TrendsSIdebar";
import { Metadata } from "next";
import ForYoufeed from "./ForYoufeed";
import PostEditor from "@/components/posts/editor/PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingPage from "./FollowingFeed";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Home() {
  return (
    <main className="w-full  min-w-0  flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <Tabs defaultValue="for-you" className="">
          <TabsList className="w-full mb-4 bg-slate-400 dark:bg-neutral-900">
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYoufeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingPage />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
