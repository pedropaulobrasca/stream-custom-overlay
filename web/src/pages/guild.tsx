import { useState } from "react";
import { Users, Trophy, Swords, TrendingUp, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GuildMember {
  id: string;
  name: string;
  role: string;
  fameTotal: number;
  fameWeekly: number;
  lastActive: string;
  killFame: number;
  deathFame: number;
  avatar?: string;
}

interface GuildEvent {
  id: string;
  type: "zvz" | "dungeon" | "gathering" | "other";
  title: string;
  description: string;
  date: string;
  participants: number;
  status: "scheduled" | "ongoing" | "completed";
}

const mockMembers: GuildMember[] = [
  {
    id: "1",
    name: "DragonSlayer",
    role: "Guild Master",
    fameTotal: 15420000,
    fameWeekly: 850000,
    lastActive: "2 hours ago",
    killFame: 2340000,
    deathFame: 450000,
  },
  {
    id: "2",
    name: "ShadowHunter",
    role: "Officer",
    fameTotal: 12890000,
    fameWeekly: 720000,
    lastActive: "1 day ago",
    killFame: 1890000,
    deathFame: 320000,
  },
  {
    id: "3",
    name: "MysticHealer",
    role: "Member",
    fameTotal: 8450000,
    fameWeekly: 420000,
    lastActive: "30 min ago",
    killFame: 890000,
    deathFame: 180000,
  },
];

const mockEvents: GuildEvent[] = [
  {
    id: "1",
    type: "zvz",
    title: "Territory Defense - Mercia",
    description: "Defending our territory against hostile guild",
    date: "2024-07-27 20:00",
    participants: 45,
    status: "scheduled",
  },
  {
    id: "2",
    type: "dungeon",
    title: "Static Dungeon Run",
    description: "Group fame farming in T8 static dungeons",
    date: "2024-07-26 19:30",
    participants: 12,
    status: "completed",
  },
  {
    id: "3",
    type: "gathering",
    title: "Guild Gathering Event",
    description: "Organized resource gathering in the Roads",
    date: "2024-07-28 15:00",
    participants: 18,
    status: "scheduled",
  },
];

const eventTypeIcons = {
  zvz: Swords,
  dungeon: Shield,
  gathering: TrendingUp,
  other: Calendar,
};

const eventTypeColors = {
  zvz: "bg-red-500",
  dungeon: "bg-blue-500",
  gathering: "bg-green-500",
  other: "bg-gray-500",
};

function GuildPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const totalGuildFame = mockMembers.reduce((total, member) => total + member.fameTotal, 0);
  const weeklyGuildFame = mockMembers.reduce((total, member) => total + member.fameWeekly, 0);
  const totalKillFame = mockMembers.reduce((total, member) => total + member.killFame, 0);

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Guild Management Tools</h1>
          <p className="text-muted-foreground">
            Manage your Albion Online guild activities and track member progress
          </p>
        </div>
        <Button>
          <Users className="w-4 h-4 mr-2" />
          Invite Members
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Guild Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Guild Fame</CardDescription>
                <CardTitle className="text-2xl">
                  {(totalGuildFame / 1000000).toFixed(1)}M
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  +{(weeklyGuildFame / 1000000).toFixed(1)}M this week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Members</CardDescription>
                <CardTitle className="text-2xl">{mockMembers.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Users className="w-4 h-4" />
                  {mockMembers.filter(m => m.lastActive.includes("hour") || m.lastActive.includes("min")).length} online
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>PvP Performance</CardDescription>
                <CardTitle className="text-2xl">
                  {((totalKillFame / 1000000)).toFixed(1)}M
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <Trophy className="w-4 h-4" />
                  Kill Fame earned
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Scheduled guild activities and important dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEvents.filter(event => event.status === "scheduled").map((event) => {
                  const EventIcon = eventTypeIcons[event.type];
                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${eventTypeColors[event.type]}`}>
                          <EventIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.date}</p>
                        <p className="text-xs text-muted-foreground">{event.participants} participants</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guild Members</CardTitle>
              <CardDescription>
                Track member activity, fame, and contribution to the guild
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Total Fame</TableHead>
                    <TableHead>Weekly Fame</TableHead>
                    <TableHead>PvP Fame</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.role === "Guild Master" ? "default" : member.role === "Officer" ? "secondary" : "outline"}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {(member.fameTotal / 1000000).toFixed(1)}M
                      </TableCell>
                      <TableCell className="font-mono">
                        {(member.fameWeekly / 1000).toFixed(0)}K
                      </TableCell>
                      <TableCell className="font-mono">
                        {(member.killFame / 1000000).toFixed(1)}M
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.lastActive}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guild Events</CardTitle>
              <CardDescription>
                Manage and track guild activities and scheduled events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEvents.map((event) => {
                  const EventIcon = eventTypeIcons[event.type];
                  return (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded ${eventTypeColors[event.type]}`}>
                          <EventIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.date} • {event.participants} participants
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={event.status === "completed" ? "default" :
                          event.status === "ongoing" ? "secondary" : "outline"}
                      >
                        {event.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fame Progression</CardTitle>
                <CardDescription>Weekly fame gains by guild members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                  <p>Analytics charts coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Heatmap</CardTitle>
                <CardDescription>Member activity throughout the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2" />
                  <p>Activity tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GuildPage;
