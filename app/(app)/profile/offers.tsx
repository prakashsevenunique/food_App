import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OffersDealsScreen() {
  const [activeTab, setActiveTab] = useState<'men' | 'women'>('men');

  // Sample data
  const menOffers = [
    {
      id: '1',
      title: 'Summer Special',
      discount: '50% OFF',
      description: 'On all men\'s t-shirts',
      image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      code: 'MEN50',
      expiry: 'Jun 30, 2023'
    },
    {
      id: '2',
      title: 'Weekend Sale',
      discount: 'Buy 1 Get 1 Free',
      description: 'On selected men\'s jeans',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      code: 'BOGOMEN',
      expiry: 'Jun 25, 2023'
    },
    {
        id: '3',
        title: 'Summer Special',
        discount: '50% OFF',
        description: 'On all men\'s t-shirts',
        image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        code: 'MEN50',
        expiry: 'Jun 30, 2023'
      },
      {
        id: '4',
        title: 'Weekend Sale',
        discount: 'Buy 1 Get 1 Free',
        description: 'On selected men\'s jeans',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        code: 'BOGOMEN',
        expiry: 'Jun 25, 2023'
      },
  ];

  const womenOffers = [
    {
      id: '1',
      title: 'Flash Sale',
      discount: '60% OFF',
      description: 'On all women\'s dresses',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      code: 'WOMEN60',
      expiry: 'Jun 28, 2023'
    },
    {
      id: '2',
      title: 'New Collection',
      discount: '30% OFF',
      description: 'On all ethnic wear',
      image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      code: 'ETHNIC30',
      expiry: 'Jul 15, 2023'
    },
  ];

  const renderOfferItem = ({ item }: { item: typeof menOffers[0] }) => (
    <View className="mb-5 mx-2">
      <View className="relative rounded-xl overflow-hidden">
        <Image
          source={{ uri: item.image }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
          <Text className="text-white text-xl font-bold">{item.title}</Text>
          <Text className="text-pink-400 text-2xl font-extrabold">{item.discount}</Text>
          <Text className="text-white">{item.description}</Text>
        </View>
      </View>
      
      <View className="bg-white p-4 rounded-b-xl shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-700">Use Code:</Text>
          <Text className="font-bold text-lg">{item.code}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500 text-sm">Valid until {item.expiry}</Text>
          <TouchableOpacity className="bg-pink-600 px-4 py-2 rounded-full">
            <Text className="text-white font-medium">Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 shadow-md">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons onPress={() => router.back()} name="arrow-back" size={25} color="#E6007E" />
            <Text className="text-lg font-bold ml-2">Offers & Deals</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white shadow-sm">
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${activeTab === 'men' ? 'border-b-2 border-pink-600' : ''}`}
          onPress={() => setActiveTab('men')}
        >
          <Text className={`font-bold ${activeTab === 'men' ? 'text-pink-600' : 'text-gray-500'}`}>
            Men
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${activeTab === 'women' ? 'border-b-2 border-pink-600' : ''}`}
          onPress={() => setActiveTab('women')}
        >
          <Text className={`font-bold ${activeTab === 'women' ? 'text-pink-600' : 'text-gray-500'}`}>
            Women
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-2">
        {activeTab === 'men' ? (
          menOffers.length > 0 ? (
            <FlatList
              data={menOffers}
              renderItem={renderOfferItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center justify-center py-20">
              <MaterialIcons name="tag" size={50} color="#CCCCCC" />
              <Text className="text-gray-500 mt-4 text-lg">No offers for men right now</Text>
              <Text className="text-gray-400 mt-1">Check back later!</Text>
            </View>
          )
        ) : womenOffers.length > 0 ? (
          <FlatList
            data={womenOffers}
            renderItem={renderOfferItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View className="items-center justify-center py-20">
            <MaterialIcons name="tag" size={50} color="#CCCCCC" />
            <Text className="text-gray-500 mt-4 text-lg">No offers for women right now</Text>
            <Text className="text-gray-400 mt-1">Check back later!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}