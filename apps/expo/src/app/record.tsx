import { Stack } from "expo-router";
import { Button, Card, Input, Screen, Text } from "@/components/ui";
import { light } from "@/theme";

const t = light;

const fields = [
  { label: "Feed given (kg)", value: "125" },
  { label: "Egg count", value: "842" },
  { label: "Mortality", value: "3" },
  { label: "Notes", value: "Birds active. Water line checked." },
];

export default function RecordScreen() {
  return (
    <Screen theme={t}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Daily Record",
          headerStyle: {
            backgroundColor: t.background,
          },
          headerShadowVisible: false,
        }}
      />

      <Card theme={t}>
        <Text variant="tag" color="accent" theme={t}>
          Quick entry
        </Text>
        <Text variant="heading" theme={t}>
          Record today's flock activity in under a minute.
        </Text>
        <Text variant="detail" color="textTertiary" theme={t}>
          This screen is ready to be wired to the real `dailyRecords.create`
          flow next.
        </Text>
      </Card>

      {fields.map((field) => (
        <Input
          key={field.label}
          label={field.label}
          defaultValue={field.value}
          multiline={field.label === "Notes"}
          theme={t}
        />
      ))}

      <Button theme={t}>Save daily record</Button>
    </Screen>
  );
}
