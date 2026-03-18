"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { useI18n } from "@/lib/i18n-context"

interface InviteUser {
  id: number
  invitee_email: string | null
  used_at: string | null
}

interface InviteUserListProps {
  invites: InviteUser[]
  loading: boolean
}

export function InviteUserList({ invites, loading }: InviteUserListProps) {
  const { t } = useI18n()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("invite.myInvites")}</CardTitle>
        <CardDescription>{t("invite.myInvitesDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">{t("invite.loading")}</div>
        ) : invites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("invite.noInvites")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-4 p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-medium truncate">
                    {invite.invitee_email || t("invite.unknownUser")}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {invite.used_at
                      ? format(new Date(invite.used_at), "yyyy-MM-dd HH:mm")
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
