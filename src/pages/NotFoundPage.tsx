import { MapPinOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, EmptyState } from "../components/ui";

export function NotFoundPage() {
  return <EmptyState icon={<MapPinOff size={24} />} title="Page not found" description="This camp page does not exist or may have moved." action={<Link to="/home"><Button>Back to home</Button></Link>} />;
}
