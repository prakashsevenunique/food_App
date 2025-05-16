import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS
} from 'react-native-reanimated';
import { imageBaseUrl } from '@/utils/helpingData';

const { width: screenWidth } = Dimensions.get('window');

const PaginationItem = ({
  active,
  activeWidth = 14,
  inactiveWidth = 8
}: {
  active: boolean;
  activeWidth?: number;
  inactiveWidth?: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(active ? activeWidth : inactiveWidth, {
        damping: 10,
        stiffness: 100
      }),
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: inactiveWidth,
          borderRadius: inactiveWidth / 2,
          backgroundColor: active ? '#E6007E' : 'rgba(255,255,255,0.5)',
          marginHorizontal: 2,
        },
        animatedStyle
      ]}
    />
  );
};

const SalonImageCarousel = ({ images, home }: any) => {
  const progressValue = useSharedValue(0);
  const currentIndex = useSharedValue(0);
  const [visibleIndex, setVisibleIndex] = React.useState(0);
  const carouselHeight = home ? 150 : 180;

  // This synchronizes the UI state with the Reanimated value
  useAnimatedReaction(
    () => currentIndex.value,
    (current) => {
      runOnJS(setVisibleIndex)(current);
    }
  );

  return (
    <View className="relative mb-2 ">
      <Carousel
        loop
        width={screenWidth * 1}
        height={carouselHeight}
        autoPlay={images.length > 1}
        autoPlayInterval={4000}
        data={images}
        onProgressChange={(_, absoluteProgress) => {
          progressValue.value = absoluteProgress;
          currentIndex.value = Math.round(absoluteProgress) % images.length;
        }}
        scrollAnimationDuration={800}
        renderItem={({ item }) => (
          <View className="mx-2">
            <Image
              source={home ? item : { uri: home ? item : `${imageBaseUrl}/${item}` }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* Indicators */}
      {images.length > 1 && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center">
          {images.map((_, index) => (
            <PaginationItem
              key={index}
              active={visibleIndex === index}
            />
          ))}
        </View>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <View className="absolute top-3 right-6 bg-black/60 px-2 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">
            {visibleIndex + 1}/{images.length}
          </Text>
        </View>
      )}
    </View>
  );
};

export default SalonImageCarousel;