import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { endpoints } from "../api/endpoints";
import type { Activity } from "../api/types";
import { EmptyState, LoadingState, PageIntro, QueryError } from "../components/ui";
import { format } from "date-fns";

export function ActivitiesPage() {
  const query = useQuery({ queryKey: ["activities"], queryFn: ({ signal }) => endpoints.activities(signal) });
  if (query.isLoading) return <LoadingState label="Loading the camp schedule" />;
  if (query.error) return <QueryError error={query.error} />;
  const groups = (query.data || []).reduce<Record<string, Activity[]>>((result, activity) => {
    const date = format(new Date(activity.startsAt), "yyyy-MM-dd");
    (result[date] ||= []).push(activity);
    return result;
  }, {});

  return (
    <div>
      <PageIntro eyebrow="Camp programme" title="Activities" description="Times shown in Thailand time." />
      {!query.data?.length ? <EmptyState icon={<CalendarDays size={24} />} title="Schedule coming soon" description="Published activities will appear here." /> : (
        <div className="schedule">
          {Object.entries(groups).map(([date, activities]) => (
            <section className="schedule-day" key={date}>
              <div className="schedule-day__date"><strong>{format(new Date(`${date}T00:00:00`), "d")}</strong><span>{format(new Date(`${date}T00:00:00`), "EEE")}<br />{format(new Date(`${date}T00:00:00`), "MMM")}</span></div>
              <div className="schedule-day__items">
                {activities.map((activity) => (
                  <article className="activity-row" key={activity.id}>
                    <div className="activity-row__time"><Clock3 size={15} />{format(new Date(activity.startsAt), "HH:mm")}–{format(new Date(activity.endsAt), "HH:mm")}</div>
                    <h2>{activity.name}</h2>
                    {activity.location && <p className="activity-row__location"><MapPin size={15} />{activity.location}</p>}
                    {activity.description && <p>{activity.description}</p>}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
