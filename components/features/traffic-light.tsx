import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrafficLightProps {
    trafficLight: "red" | "yellow" | "green";
}

const config = {
    red: {
        label: "High Risk",
        icon: AlertCircle,
        className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
    },
    yellow: {
        label: "Proceed with Caution",
        icon: AlertTriangle,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    },
    green: {
        label: "Strong Foundation",
        icon: CheckCircle2,
        className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
    },
};

export function TrafficLight({ trafficLight }: TrafficLightProps) {
    const { label, icon: Icon, className } = config[trafficLight];

    return (
        <Badge variant="outline" className={cn("flex items-center gap-1.5 px-3 py-1 text-sm font-medium", className)}>
            <Icon className="h-4 w-4" />
            {label}
        </Badge>
    );
}
