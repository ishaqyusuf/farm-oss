import { Stack } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fields = [
  { label: "Feed given (kg)", value: "125" },
  { label: "Egg count", value: "842" },
  { label: "Mortality", value: "3" },
  { label: "Notes", value: "Birds active. Water line checked." }
];

export default function RecordScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f1e6" }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Daily Record",
          headerStyle: {
            backgroundColor: "#f6f1e6"
          },
          headerShadowVisible: false
        }}
      />
      <ScrollView contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 40 }}>
        <View
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#ded5c3",
            borderRadius: 24,
            borderWidth: 1,
            gap: 8,
            padding: 20
          }}
        >
          <Text style={{ color: "#2f6b3b", fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            Quick entry
          </Text>
          <Text style={{ color: "#1c2415", fontSize: 28, fontWeight: "800", lineHeight: 32 }}>
            Record today’s flock activity in under a minute.
          </Text>
          <Text style={{ color: "#5d6558", fontSize: 15, lineHeight: 23 }}>
            This screen is ready to be wired to the real `dailyRecords.create` flow next.
          </Text>
        </View>

        {fields.map((field) => (
          <View key={field.label} style={{ gap: 8 }}>
            <Text style={{ color: "#2b3324", fontSize: 14, fontWeight: "700" }}>{field.label}</Text>
            <TextInput
              defaultValue={field.value}
              multiline={field.label === "Notes"}
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#d7cfbe",
                borderRadius: 16,
                borderWidth: 1,
                color: "#1c2415",
                fontSize: 16,
                minHeight: field.label === "Notes" ? 120 : 54,
                paddingHorizontal: 16,
                paddingTop: field.label === "Notes" ? 16 : 0
              }}
            />
          </View>
        ))}

        <Pressable
          style={{
            alignItems: "center",
            backgroundColor: "#2f6b3b",
            borderRadius: 16,
            justifyContent: "center",
            minHeight: 54
          }}
        >
          <Text style={{ color: "#f6f1e6", fontSize: 16, fontWeight: "700" }}>Save daily record</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

