import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native"
import { useState } from "react"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"

// Su stylo Salon color palette
const colors = {
    primary: "#E65305", // Bright red-orange as primary
    primaryLight: "#FF7A3D", // Lighter version of primary
    primaryLighter: "#FFA273", // Even lighter version
    secondary: "#FBA059", // Light orange as secondary
    secondaryLight: "#FFC59F", // Lighter version of secondary
    accent: "#FB8807", // Bright orange as accent
    accentLight: "#FFAA4D", // Lighter version of accent
    tertiary: "#F4A36C", // Peach/salmon as tertiary
    tertiaryLight: "#FFD0B0", // Lighter version of tertiary
    background: "#FFF9F5", // Very light orange/peach background
    cardBg: "#FFFFFF", // White for cards
    text: "#3D2C24", // Dark brown for text
    textLight: "#7D6E66", // Lighter text color
    textLighter: "#A99E98", // Even lighter text
    divider: "#FFE8D6", // Very light divider color
}

export default function HelpCenter() {
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})

    const toggleItem = (index: number) => {
        setExpandedItems((prev) => ({
            ...prev,
            [index]: !prev[index],
        }))
    }

    const faqs = [
        {
            question: "How do I book an appointment on Su Stylo?",
            answer: `Booking an appointment is easy:\n\n1. Open the Su Stylo app\n2. Browse or search for nearby salons\n3. Select a salon and choose your desired service\n4. Pick a date and time slot that works for you\n5. Confirm your booking – that's it!\n\nYou'll receive a confirmation via app notification or email.`,
        },
        {
            question: "Can I cancel or reschedule a booking?",
            answer: `Yes! To cancel or change your appointment:\n\n1. Go to "My Bookings" in the app\n2. Select the appointment you wish to change\n3. Choose "Cancel" or "Reschedule" and follow the prompts\n\nPlease note: Cancellations made close to the appointment time may be subject to our cancellation policy.`,
        },
        {
            question: "What payment methods are accepted?",
            answer: `We currently accept the following payment options:\n\n• UPI (Google Pay, PhonePe, Paytm, etc.)\n• Debit/Credit Cards\n• Net Banking\n• Cash (available at selected partner salons)\n\nFor online payments, all transactions are 100% secure.`,
        },
        {
            question: "Am I eligible for a refund if I cancel?",
            answer: `Refunds are processed as per our Refund & Cancellation Policy:\n\n• If you cancel before the salon's cutoff time, a full refund will be initiated\n• If you cancel late or miss your appointment, partial or no refund may apply\n• Refunds for prepaid bookings will be credited back to your original payment method within 5–7 business days`,
        },
        {
            question: "How do I contact customer support?",
            answer: `You can reach us via:\n\n• Email: info@sustylo.com\n• Phone: +91-7297026119\n• Operating Hours: Monday–Saturday, 10:00 AM – 6:00 PM\n\nWe aim to respond within 24 hours for all queries.`,
        },
        {
            question: "Is my data safe with Su Stylo?",
            answer: `Yes, your privacy is our priority. We follow strict data protection standards and never share your personal information without your consent. For full details, visit our Privacy Policy.`,
        },
    ]

    const handleEmailPress = () => {
        Linking.openURL("mailto:info@sustylo.com")
    }

    const handlePhonePress = () => {
        Linking.openURL("tel:+917297026119")
    }

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View
                className="p-6 pb-4"
                style={{
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                }}
            >
                <View className="flex-row items-center mb-2">
                    {/* <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity> */}
                    <Text className="text-2xl font-bold text-white">Help Center</Text>
                </View>
                <Text style={{ color: colors.tertiaryLight }} className="mt-1">
                    Find answers to common questions or contact our support team
                </Text>
            </View>

            {/* FAQ Section */}
            <ScrollView className="px-4 py-6">
                <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                    Frequently Asked Questions
                </Text>

                {faqs.map((item, index) => (
                    <View
                        key={index}
                        className="mb-4 rounded-lg overflow-hidden"
                        style={{
                            backgroundColor: colors.cardBg,
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                        }}
                    >
                        <TouchableOpacity onPress={() => toggleItem(index)} className="p-4 flex-row justify-between items-center">
                            <Text className="font-medium flex-1 pr-2" style={{ color: colors.text }}>
                                {item.question}
                            </Text>
                            {expandedItems[index] ? (
                                <Ionicons name="chevron-up" size={20} color={colors.textLight} />
                            ) : (
                                <Ionicons name="chevron-down" size={20} color={colors.textLight} />
                            )}
                        </TouchableOpacity>

                        {expandedItems[index] && (
                            <View className="px-4 pb-4">
                                <Text className="whitespace-pre-line" style={{ color: colors.textLight }}>
                                    {item.answer}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}

                <View
                    className="p-3 rounded-lg mb-12"
                    style={{
                        backgroundColor: colors.cardBg,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 1,
                    }}
                >
                    <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                        Still need help?
                    </Text>
                    <Text className="mb-4" style={{ color: colors.textLight }}>
                        Contact our support team directly:
                    </Text>

                    <TouchableOpacity
                        onPress={handleEmailPress}
                        className="flex-row items-center mb-3 p-3 rounded-lg"
                        style={{ backgroundColor: colors.tertiaryLight }}
                    >
                        <MaterialIcons name="email" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                        <Text style={{ color: colors.text }}>info@sustylo.com</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handlePhonePress}
                        className="flex-row items-center p-3 rounded-lg"
                        style={{ backgroundColor: colors.tertiaryLight }}
                    >
                        <MaterialIcons name="phone" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                        <Text style={{ color: colors.text }}>+91-7297026119</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>


        </View>
    )
}
