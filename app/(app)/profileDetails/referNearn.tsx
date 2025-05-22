import { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Share,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"

const { width } = Dimensions.get("window")

const COLORS = {
  primary: "#FF5A5F",
  secondary: "#FFB74D",
  tertiary: "#4CAF50",
  accent1: "#8E24AA",
  accent2: "#1E88E5",
  dark: "#263238",
  light: "#FFFFFF",
  background: "#F9F9F9",
  card: "#FFFFFF",
  text: "#263238",
  textLight: "#78909C",
  success: "#66BB6A",
  error: "#EF5350",
  warning: "#FFA000",
  gradient1: ["#FF5A5F", "#FF8A65"],
  gradient2: ["#FFB74D", "#FFA000"],
  gradient3: ["#4CAF50", "#2E7D32"],
  gradient4: ["#8E24AA", "#6A1B9A"],
  gradient5: ["#1E88E5", "#1565C0"],
}

// Mock referral data - in a real app, this would come from your API
const mockReferralData = {
  referralCode: "FOODIE123",
  referralLink: "https://foodapp.com/ref/FOODIE123",
  creditsPerReferral: 10,
  totalEarned: 30,
  pendingCredits: 10,
  referrals: [
    {
      id: "ref1",
      name: "John Doe",
      date: "2023-05-10T14:30:00Z",
      status: "completed",
      credits: 10,
    },
    {
      id: "ref2",
      name: "Jane Smith",
      date: "2023-05-15T10:15:00Z",
      status: "completed",
      credits: 10,
    },
    {
      id: "ref3",
      name: "Mike Johnson",
      date: "2023-05-18T16:45:00Z",
      status: "completed",
      credits: 10,
    },
    {
      id: "ref4",
      name: "Sarah Williams",
      date: "2023-05-20T09:30:00Z",
      status: "pending",
      credits: 10,
    },
  ],
  howItWorks: [
    "Invite friends using your unique referral code",
    "Your friend gets $10 off their first order",
    "You get $10 when they complete their first order",
    "There's no limit to how many friends you can refer",
  ],
}

export default function ReferEarnScreen() {
  const insets = useSafeAreaInsets()
  const [referralData, setReferralData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copiedText, setCopiedText] = useState("")
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const bounceAnim = useRef(new Animated.Value(1)).current

  // Fetch referral data
  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, you would fetch from your API
      // const response = await api.get('/user/referrals')
      // const data = response.data

      // Using mock data for demonstration
      setTimeout(() => {
        setReferralData(mockReferralData)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Failed to fetch referral data:", err)
      setError(err.message || "Failed to load referral data")
      setLoading(false)
    }
  }

  // Animations
  useEffect(() => {
    if (!loading && referralData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [loading, referralData])

  const triggerHaptic = (type = "light") => {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        break
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        break
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleBack = () => {
    triggerHaptic("light")
    router.back()
  }

  const copyToClipboard = async (text) => {
    triggerHaptic("success")
    await Clipboard.setStringAsync(text)
    setCopiedText(text)
    setShowCopiedMessage(true)

    // Animate the bounce effect
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    // Hide the copied message after 2 seconds
    setTimeout(() => {
      setShowCopiedMessage(false)
    }, 2000)
  }

  const handleShare = async () => {
    triggerHaptic("medium")
    try {
      const result = await Share.share({
        message: `Use my referral code ${referralData.referralCode} to get $10 off your first order on FoodApp! Download now: ${referralData.referralLink}`,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading referral data...</Text>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReferralData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!referralData) {
    return null
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={COLORS.gradient1}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1488330890490-c291ecf62571?w=500&h=500&fit=crop",
                }}
                style={styles.heroImage}
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Invite Friends & Earn</Text>
                <Text style={styles.heroSubtitle}>
                  Get ${referralData.creditsPerReferral} for each friend who joins and orders
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Referral Code Section */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeWrapper}>
              <Animated.View
                style={[
                  styles.codeBox,
                  {
                    transform: [{ scale: showCopiedMessage && copiedText === referralData.referralCode ? bounceAnim : 1 }],
                  },
                ]}
              >
                <Text style={styles.codeText}>{referralData.referralCode}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(referralData.referralCode)}
                >
                  <Ionicons
                    name={
                      showCopiedMessage && copiedText === referralData.referralCode ? "checkmark-outline" : "copy-outline"
                    }
                    size={20}
                    color={
                      showCopiedMessage && copiedText === referralData.referralCode ? COLORS.success : COLORS.primary
                    }
                  />
                </TouchableOpacity>
              </Animated.View>
              {showCopiedMessage && copiedText === referralData.referralCode && (
                <Text style={styles.copiedMessage}>Copied to clipboard!</Text>
              )}
            </View>
          </View>

          {/* Share Options */}
          <View style={styles.shareContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <LinearGradient
                colors={COLORS.gradient1}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shareButtonGradient}
              >
                <Ionicons name="share-social" size={20} color={COLORS.light} />
                <Text style={styles.shareButtonText}>Share with Friends</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${referralData.totalEarned}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${referralData.pendingCredits}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{referralData.referrals.length}</Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </View>
          </View>

          {/* How It Works Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.howItWorksContainer}>
              {referralData.howItWorks.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Referral History Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Referral History</Text>
            {referralData.referrals.length > 0 ? (
              <View style={styles.referralHistoryContainer}>
                {referralData.referrals.map((referral) => (
                  <View key={referral.id} style={styles.referralItem}>
                    <View style={styles.referralUserInfo}>
                      <View style={styles.referralAvatar}>
                        <Text style={styles.referralAvatarText}>{referral.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.referralDetails}>
                        <Text style={styles.referralName}>{referral.name}</Text>
                        <Text style={styles.referralDate}>{formatDate(referral.date)}</Text>
                      </View>
                    </View>
                    <View style={styles.referralStatusContainer}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              referral.status === "completed" ? COLORS.success + "20" : COLORS.warning + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: referral.status === "completed" ? COLORS.success : COLORS.warning,
                            },
                          ]}
                        >
                          {referral.status === "completed" ? "Completed" : "Pending"}
                        </Text>
                      </View>
                      <Text style={styles.referralCredits}>+${referral.credits}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyReferralsContainer}>
                <Ionicons name="people-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyReferralsText}>No referrals yet</Text>
                <Text style={styles.emptyReferralsSubtext}>Share your code to start earning</Text>
              </View>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By participating in our referral program, you agree to our{" "}
              <Text style={styles.termsLink}>Terms & Conditions</Text>.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.light,
    fontWeight: "600",
  },
  heroContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroGradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 180,
    opacity: 0.6,
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.light,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.light,
    opacity: 0.9,
  },
  codeContainer: {
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  codeWrapper: {
    alignItems: "center",
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  codeText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
  },
  copiedMessage: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 8,
  },
  shareContainer: {
    marginBottom: 24,
  },
  shareButton: {
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  shareButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.light,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  howItWorksContainer: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  referralHistoryContainer: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  referralItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  referralUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  referralAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  referralDetails: {
    flex: 1,
  },
  referralName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  referralDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  referralStatusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  referralCredits: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.success,
  },
  emptyReferralsContainer: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyReferralsText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
  },
  emptyReferralsSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: "center",
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
})
