import { Controller, type Control, type UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RECURRENCE_TYPES,
  RECURRENCE_TYPE_HUMAN,
  WEEKDAYS_ES,
  WEEKDAY_HUMAN,
  WEEKS_OF_MONTH_ES,
  WEEK_OF_MONTH_HUMAN,
  type RecurrenceType,
  type WeekdayEs,
  type WeekOfMonthEs,
} from "@/lib/recurrence";

/** Recurrence fields shared between the public submit form and the admin drawer. */
export interface RecurrenceFormShape {
  recurrence_type: string;
  recurrence_day_of_week: string;
  recurrence_week_of_month: string;
  recurrence_start_date: string;
  recurrence_end_date: string;
  start_time: string;
  end_time: string;
}

interface Props<T extends RecurrenceFormShape> {
  // react-hook-form types are invariant; cast at call site is fine.
  control: Control<T>;
  watch: UseFormWatch<T>;
  /** Optional compact variant for the admin drawer. */
  compact?: boolean;
}

export function RecurrenceFields<T extends RecurrenceFormShape>({
  control,
  watch,
  compact = false,
}: Props<T>) {
  // Cast: form field names are known constants present in T (extends RecurrenceFormShape)
  const type = watch("recurrence_type" as never) as unknown as string;
  const isUnique = type === "unico";
  const isMonthly = type === "mensual_por_dia";
  const needsDay = type === "semanal" || type === "quincenal" || isMonthly;

  const startLabel = isUnique ? "Fecha del evento *" : "Empieza el *";
  const gap = compact ? "gap-3" : "gap-4";

  return (
    <div className={`space-y-${compact ? "3" : "4"}`}>
      <Wrap label="¿Con qué frecuencia ocurre? *">
        <Controller
          control={control}
          name={"recurrence_type" as never}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              value={(field.value as string) || "unico"}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {RECURRENCE_TYPE_HUMAN[t as RecurrenceType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Wrap>

      {needsDay && (
        <div className={`grid ${gap} ${isMonthly ? "sm:grid-cols-2" : ""}`}>
          {isMonthly && (
            <Wrap label="Semana del mes *">
              <Controller
                control={control}
                name={"recurrence_week_of_month" as never}
                rules={{ required: isMonthly }}
                render={({ field }) => (
                  <Select
                    value={(field.value as string) || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKS_OF_MONTH_ES.map((w) => (
                        <SelectItem key={w} value={w}>
                          {WEEK_OF_MONTH_HUMAN[w as WeekOfMonthEs]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Wrap>
          )}
          <Wrap label="Día de la semana *">
            <Controller
              control={control}
              name={"recurrence_day_of_week" as never}
              rules={{ required: needsDay }}
              render={({ field }) => (
                <Select
                  value={(field.value as string) || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS_ES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {WEEKDAY_HUMAN[d as WeekdayEs]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Wrap>
        </div>
      )}

      <div className={`grid ${gap} sm:grid-cols-3`}>
        <Wrap label={startLabel}>
          <Controller
            control={control}
            name={"recurrence_start_date" as never}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                type="date"
                value={(field.value as string) || ""}
                onChange={field.onChange}
              />
            )}
          />
        </Wrap>
        <Wrap label="Hora inicio *">
          <Controller
            control={control}
            name={"start_time" as never}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                type="time"
                value={(field.value as string) || ""}
                onChange={field.onChange}
              />
            )}
          />
        </Wrap>
        <Wrap label="Hora fin *">
          <Controller
            control={control}
            name={"end_time" as never}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                type="time"
                value={(field.value as string) || ""}
                onChange={field.onChange}
              />
            )}
          />
        </Wrap>
      </div>

      {!isUnique && (
        <Wrap label="Termina el (opcional)">
          <Controller
            control={control}
            name={"recurrence_end_date" as never}
            render={({ field }) => (
              <Input
                type="date"
                value={(field.value as string) || ""}
                onChange={field.onChange}
              />
            )}
          />
          <p className="text-xs text-muted-foreground">
            Déjalo en blanco si el mercado no tiene fecha de fin.
          </p>
        </Wrap>
      )}
    </div>
  );
}

function Wrap({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-[#1c1e37]/70">
        {label}
      </Label>
      {children}
    </div>
  );
}
