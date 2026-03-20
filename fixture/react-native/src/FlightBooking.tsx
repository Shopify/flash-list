import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

interface Flight {
  id: number;
  airline: string;
  airlineCode: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  stops: number;
  accentColor: string;
}

interface Destination {
  id: number;
  city: string;
  country: string;
  price: number;
  color: string;
  emoji: string;
}

interface Deal {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  color: string;
}

interface Section {
  id: string;
  type: "deals" | "destinations" | "flights";
  title: string;
  data: any[];
}

const airlines = [
  { name: "SkyWings", code: "SW", color: "#0066CC" },
  { name: "AeroConnect", code: "AC", color: "#E63946" },
  { name: "Pacific Air", code: "PA", color: "#2A9D8F" },
  { name: "Sunset Airlines", code: "SA", color: "#E76F51" },
  { name: "NorthStar", code: "NS", color: "#6A4C93" },
  { name: "BlueSky", code: "BS", color: "#457B9D" },
];

const cities = [
  { city: "New York", code: "JFK" },
  { city: "London", code: "LHR" },
  { city: "Tokyo", code: "NRT" },
  { city: "Paris", code: "CDG" },
  { city: "Dubai", code: "DXB" },
  { city: "Singapore", code: "SIN" },
  { city: "Sydney", code: "SYD" },
  { city: "Los Angeles", code: "LAX" },
  { city: "Bangkok", code: "BKK" },
  { city: "Rome", code: "FCO" },
];

const generateFlights = (count: number): Flight[] => {
  return Array.from({ length: count }, (_, i) => {
    const airline = airlines[i % airlines.length];
    const from = cities[i % cities.length];
    const to = cities[(i + 3) % cities.length];
    const hour = 6 + (i % 16);
    const durationHrs = 2 + (i % 12);
    const arrHour = (hour + durationHrs) % 24;
    return {
      id: i,
      airline: airline.name,
      airlineCode: airline.code,
      from: from.city,
      fromCode: from.code,
      to: to.city,
      toCode: to.code,
      departure: `${hour.toString().padStart(2, "0")}:${((i * 15) % 60)
        .toString()
        .padStart(2, "0")}`,
      arrival: `${arrHour.toString().padStart(2, "0")}:${((i * 15 + 30) % 60)
        .toString()
        .padStart(2, "0")}`,
      duration: `${durationHrs}h ${(i * 10) % 60}m`,
      price: 150 + i * 37,
      stops: i % 3,
      accentColor: airline.color,
    };
  });
};

const generateDestinations = (): Destination[] => {
  const destinations = [
    { city: "Bali", country: "Indonesia", emoji: "🏝" },
    { city: "Santorini", country: "Greece", emoji: "🏛" },
    { city: "Kyoto", country: "Japan", emoji: "⛩" },
    { city: "Machu Picchu", country: "Peru", emoji: "🏔" },
    { city: "Maldives", country: "Indian Ocean", emoji: "🐠" },
    { city: "Reykjavik", country: "Iceland", emoji: "🌋" },
    { city: "Marrakech", country: "Morocco", emoji: "🕌" },
    { city: "Queenstown", country: "New Zealand", emoji: "🌄" },
  ];
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#DDA0DD",
    "#87CEEB",
    "#F4A460",
  ];
  return destinations.map((dest, i) => ({
    id: i,
    ...dest,
    price: 299 + i * 89,
    color: colors[i % colors.length],
  }));
};

const generateDeals = (): Deal[] => {
  return [
    {
      id: 0,
      title: "Early Bird Sale",
      subtitle: "Book 30 days ahead",
      discount: "25% OFF",
      color: "#1E3A8A",
    },
    {
      id: 1,
      title: "Weekend Getaway",
      subtitle: "Fri-Sun packages",
      discount: "15% OFF",
      color: "#7E22CE",
    },
    {
      id: 2,
      title: "Business Class",
      subtitle: "Upgrade deal",
      discount: "$199",
      color: "#B45309",
    },
    {
      id: 3,
      title: "Family Bundle",
      subtitle: "4+ passengers",
      discount: "30% OFF",
      color: "#065F46",
    },
    {
      id: 4,
      title: "Last Minute",
      subtitle: "Flights this week",
      discount: "40% OFF",
      color: "#B91C1C",
    },
  ];
};

const DealCard = ({ item }: { item: Deal }) => (
  <Pressable style={[styles.dealCard, { backgroundColor: item.color }]}>
    <Text style={styles.dealDiscount}>{item.discount}</Text>
    <Text style={styles.dealTitle}>{item.title}</Text>
    <Text style={styles.dealSubtitle}>{item.subtitle}</Text>
  </Pressable>
);

const DestinationCard = ({ item }: { item: Destination }) => (
  <Pressable style={styles.destCard}>
    <View style={[styles.destImage, { backgroundColor: item.color }]}>
      <Text style={styles.destEmoji}>{item.emoji}</Text>
    </View>
    <Text style={styles.destCity}>{item.city}</Text>
    <Text style={styles.destCountry}>{item.country}</Text>
    <Text style={styles.destPrice}>From ${item.price}</Text>
  </Pressable>
);

const FlightCard = ({ item }: { item: Flight }) => (
  <Pressable style={styles.flightCard}>
    <View style={styles.flightHeader}>
      <View
        style={[styles.airlineBadge, { backgroundColor: item.accentColor }]}
      >
        <Text style={styles.airlineCode}>{item.airlineCode}</Text>
      </View>
      <Text style={styles.airlineName}>{item.airline}</Text>
      <Text style={styles.flightStops}>
        {item.stops === 0
          ? "Direct"
          : item.stops === 1
          ? "1 stop"
          : `${item.stops} stops`}
      </Text>
    </View>
    <View style={styles.flightRoute}>
      <View style={styles.flightEndpoint}>
        <Text style={styles.flightTime}>{item.departure}</Text>
        <Text style={styles.flightCode}>{item.fromCode}</Text>
      </View>
      <View style={styles.flightDivider}>
        <View style={styles.flightLine} />
        <Text style={styles.flightDuration}>{item.duration}</Text>
        <View style={styles.flightLine} />
      </View>
      <View style={styles.flightEndpoint}>
        <Text style={styles.flightTime}>{item.arrival}</Text>
        <Text style={styles.flightCode}>{item.toCode}</Text>
      </View>
    </View>
    <View style={styles.flightFooter}>
      <Text style={styles.flightCities}>
        {item.from} → {item.to}
      </Text>
      <Text style={styles.flightPrice}>${item.price}</Text>
    </View>
  </Pressable>
);

const SectionRow = ({ section }: { section: Section }) => {
  const renderItem = useCallback(
    (props: any) => {
      switch (section.type) {
        case "deals":
          return <DealCard item={props.item} />;
        case "destinations":
          return <DestinationCard item={props.item} />;
        case "flights":
          return <FlightCard item={props.item} />;
        default:
          return null;
      }
    },
    [section.type]
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Pressable>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>
      <FlashList
        horizontal
        data={section.data}
        renderItem={renderItem}
        keyExtractor={(item) => `${section.id}-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
};

const SearchHeader = () => {
  const [selectedTab, setSelectedTab] = useState<"one-way" | "round" | "multi">(
    "round"
  );

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Where to?</Text>
      <View style={styles.searchBox}>
        <Text style={styles.searchPlaceholder}>
          Search flights, destinations...
        </Text>
      </View>
      <View style={styles.tabRow}>
        {(["one-way", "round", "multi"] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "one-way"
                ? "One Way"
                : tab === "round"
                ? "Round Trip"
                : "Multi-City"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const baseSections: Section[] = [
  {
    id: "deals",
    type: "deals",
    title: "Hot Deals",
    data: generateDeals(),
  },
  {
    id: "destinations",
    type: "destinations",
    title: "Popular Destinations",
    data: generateDestinations(),
  },
  {
    id: "flights-1",
    type: "flights",
    title: "Recommended Flights",
    data: generateFlights(10),
  },
  {
    id: "flights-2",
    type: "flights",
    title: "Cheapest Flights",
    data: generateFlights(8),
  },
  {
    id: "destinations-2",
    type: "destinations",
    title: "Trending Getaways",
    data: generateDestinations().reverse(),
  },
  {
    id: "flights-3",
    type: "flights",
    title: "Business Class Picks",
    data: generateFlights(6),
  },
];

const data = Array.from({ length: 200 }, (_, index) => {
  const section = baseSections[index % baseSections.length];
  return {
    ...section,
    id: `section-${index}`,
  };
});

const FlightBooking = () => {
  const renderSection = useCallback(
    ({ item }: { item: Section }) => <SectionRow section={item} />,
    []
  );

  const header = useMemo(() => <SearchHeader />, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlashList
        data={data}
        renderItem={renderSection}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  // Header
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
  },
  tabActive: {
    backgroundColor: "#1A1A2E",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  // Sections
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  seeAll: {
    fontSize: 14,
    color: "#0066CC",
    fontWeight: "600",
  },
  horizontalList: {
    paddingHorizontal: 12,
  },
  // Deals
  dealCard: {
    width: width * 0.4,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    justifyContent: "center",
  },
  dealDiscount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  dealSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  // Destinations
  destCard: {
    width: width * 0.35,
    marginHorizontal: 8,
  },
  destImage: {
    height: 120,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  destEmoji: {
    fontSize: 40,
  },
  destCity: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginTop: 8,
  },
  destCountry: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  destPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0066CC",
    marginTop: 4,
  },
  // Flights
  flightCard: {
    width: width * 0.75,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  airlineBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  airlineCode: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  airlineName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
    flex: 1,
  },
  flightStops: {
    fontSize: 13,
    color: "#888",
  },
  flightRoute: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  flightEndpoint: {
    alignItems: "center",
    width: 60,
  },
  flightTime: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  flightCode: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  flightDivider: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  flightLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  flightDuration: {
    fontSize: 12,
    color: "#888",
    marginHorizontal: 8,
  },
  flightFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  flightCities: {
    fontSize: 13,
    color: "#888",
  },
  flightPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0066CC",
  },
});

export default FlightBooking;
