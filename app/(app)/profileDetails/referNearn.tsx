import { useContext, useRef, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Linking,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  StatusBar
} from "react-native"
import { router } from "expo-router"
import { Ionicons, Feather, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { UserContext } from "@/hooks/userInfo"
import * as Clipboard from "expo-clipboard"
import React from "react"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

const { width } = Dimensions.get("window")

// Su stylo Salon color palette - enhanced
const colors = {
  primary: "#E65305", // Bright red-orange as primary
  primaryLight: "#FF7A3D", // Lighter version of primary
  primaryLighter: "#FFA273", // Even lighter version
  primaryGradient: ["#E65305", "#FF7A3D"],
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
  success: "#4CAF50", // Green for success messages
}

export default function ReferAndEarnScreen() {
  const { userInfo } = useContext(UserContext) as any
  const referralLink = `https://play.google.com/store/apps/details?id=finunique.sustylo.app?code=${userInfo?.referralCode}`

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleShare = async () => {
    try {
      triggerHaptic("medium")
      const message = `Hey! Use my referral code ${userInfo?.referralCode} to get ₹100 off on Su Stylo Salon app. Sign up using this link: ${referralLink}`
      await Share.share({
        message,
        title: "Get ₹100 off on Su Stylo Salon!",
      })
    } catch (error) {
      console.error("Error sharing:", error.message)
    }
  }

  const handleCopyCode = () => {
    triggerHaptic("success")
    const referralCode = userInfo?.referralCode || "SUSTYLO100"
    Clipboard.setString(referralCode)

    // Show success animation instead of alert
    showCopiedAnimation()
  }

  const showCopiedAnimation = () => {
    // Create a temporary animated value for the copied animation
    const tempScale = new Animated.Value(1)

    Animated.sequence([
      Animated.timing(tempScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(tempScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()

    // Show toast or some visual feedback
    Alert.alert("Success", "Referral code copied to clipboard!")
  }

  const triggerHaptic = (type = "light") => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      switch (type) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          break
        case "medium":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          break
        case "success":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          break
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    }
  }

  const handleSocialShare = (platform) => {
    triggerHaptic("light")

    switch (platform) {
      case "whatsapp":
        Linking.openURL(
          `whatsapp://send?text=Hey! Use my referral code ${userInfo?.referralCode || "SUSTYLO100"} to get ₹100 off on Su Stylo Salon app! ${referralLink}`
        )
        break
      case "sms":
        Linking.openURL(
          `sms:?body=Hey! Use my referral code ${userInfo?.referralCode || "SUSTYLO100"} to get ₹100 off on Su Stylo Salon app! ${referralLink}`
        )
        break
      case "email":
        Linking.openURL(
          `mailto:?subject=Get ₹100 off at Su Stylo Salon!&body=Hey! Use my referral code ${userInfo?.referralCode || "SUSTYLO100"} to get ₹100 off on Su Stylo Salon app! ${referralLink}`
        )
        break
      default:
        handleShare()
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={'#F9F9F9'} />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={'#263238'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer and Earn</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#FFC59F', '#FFD0B0']}
            style={styles.heroGradient}
          >
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/3132/3132693.png" }}
              style={styles.heroImage}
            />
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Earn ₹100 for each friend!</Text>
              <Text style={styles.heroSubtitle}>
                Invite your friends to join Su Stylo Salon and get ₹100 in your wallet for every successful referral.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Your Referral Code */}
        <Animated.View
          style={[
            styles.referralCodeContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.referralCodeLabel}>Your referral code</Text>
          <View style={styles.codeContainer}>
            <View style={styles.codeBox}>
              {(userInfo?.referralCode || "SUSTYLO100").split('').map((char, index) => (
                <View key={index} style={styles.codeCharBox}>
                  <Text style={styles.codeChar}>{char}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={handleCopyCode}
              style={styles.copyButton}
            >
              <Feather name="copy" size={16} color={colors.cardBg} />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* How it works */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How it works</Text>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumberContainer, { backgroundColor: colors.primaryLighter }]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share your referral code</Text>
              <Text style={styles.stepDescription}>Share your code with friends via WhatsApp, SMS, or other platforms.</Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumberContainer, { backgroundColor: colors.secondaryLight }]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Friend signs up</Text>
              <Text style={styles.stepDescription}>Your friend downloads the app and signs up using your referral code.</Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumberContainer, { backgroundColor: colors.tertiaryLight }]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Both of you get rewarded</Text>
              <Text style={styles.stepDescription}>Your friend gets ₹100 on signup, and you get ₹100 when they complete their first appointment.</Text>
            </View>
          </View>
        </View>

        {/* Share Options */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Share via</Text>
          <View style={styles.shareOptionsContainer}>
            <TouchableOpacity
              onPress={() => handleSocialShare("whatsapp")}
              style={styles.shareOption}
            >
              <View style={[styles.shareIconContainer, { backgroundColor: "#25D366" }]}>
                <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.shareOptionText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialShare("sms")}
              style={styles.shareOption}
            >
              <View style={[styles.shareIconContainer, { backgroundColor: "#2196F3" }]}>
                <MaterialIcons name="sms" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.shareOptionText}>SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialShare("email")}
              style={styles.shareOption}
            >
              <View style={[styles.shareIconContainer, { backgroundColor: "#EA4335" }]}>
                <MaterialIcons name="email" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.shareOptionText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareOption}
            >
              <View style={[styles.shareIconContainer, { backgroundColor: colors.primary }]}>
                <Feather name="share-2" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.shareOptionText}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <View style={styles.termsList}>
            <View style={styles.termItem}>
              <View style={styles.termBullet} />
              <Text style={styles.termText}>Offer valid for new users only</Text>
            </View>
            <View style={styles.termItem}>
              <View style={styles.termBullet} />
              <Text style={styles.termText}>Both referrer and referee will receive ₹100 after the first successful appointment</Text>
            </View>
            <View style={styles.termItem}>
              <View style={styles.termBullet} />
              <Text style={styles.termText}>Reward will be credited within 24 hours of appointment completion</Text>
            </View>
            <View style={styles.termItem}>
              <View style={styles.termBullet} />
              <Text style={styles.termText}>Maximum 10 referrals per user</Text>
            </View>
            <View style={styles.termItem}>
              <View style={styles.termBullet} />
              <Text style={styles.termText}>Su Stylo Salon reserves the right to modify or terminate this program</Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleShare}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          style={styles.floatingButtonGradient}
        >
          <FontAwesome5 name="share-alt" size={20} color="#FFFFFF" />
          <Text style={styles.floatingButtonText}>Share Now</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6, // Reduced from 12
  },
  headerContainer: {
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18, // Reduced from 20
    fontWeight: "700",
    color: '#263238',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  heroImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  referralCodeContainer: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  referralCodeLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeCharBox: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  codeChar: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyButtonText: {
    color: colors.cardBg,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionContainer: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  shareOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  shareOption: {
    alignItems: 'center',
    width: width / 4 - 16,
    marginBottom: 16,
  },
  shareIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  shareOptionText: {
    fontSize: 12,
    color: colors.textLight,
  },
  statsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.divider,
    alignSelf: 'center',
  },
  termsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  termsList: {

  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  termBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  termText: {
    flex: 1,
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});