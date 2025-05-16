import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import { AirbnbRating } from 'react-native-ratings'; // Star Rating Component

const ReviewModal = ({ isVisible, onClose, onSubmit }: any) => {
    const [rating, setRating] = useState(0); // Rating state (1 to 5 stars)
    const [review, setReview] = useState(''); // Review text
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true)
        if (rating === 0 || review === '') {
            alert("Please provide both rating and review.");
            return;
        }
        await onSubmit({ rating, comment: review }, setReview, setRating);
        setLoading(false)
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>

                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '95%' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>Give Your Review</Text>

                    {/* Star Rating */}
                    <AirbnbRating
                        count={5}
                        defaultRating={rating}
                        onFinishRating={setRating}
                        size={30}
                        showRating={false}
                    />

                    {/* Review Text Input */}
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            marginTop: 15,
                            padding: 10,
                            height: 100,
                            textAlignVertical: 'top',
                        }}
                        placeholder="Write your review here"
                        multiline
                        value={review}
                        onChangeText={setReview}
                    />
                    
                        <View className="flex-row justify-evenly mt-4">
                            <TouchableOpacity
                                onPress={() => onClose()}
                                className="bg-red-500 py-3 px-6 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                className="bg-gray-200 py-3 px-6 rounded-lg bg-pink-500"
                            >
                                {loading ? <View className='flex-row'> <ActivityIndicator size="small" color="#ffffff" /><Text className="text-white font-semibold">Loading</Text></View> :<Text className="text-white font-semibold">Submit</Text>}
                            </TouchableOpacity>
                        </View>
                </View>
            </View>

        </Modal>
    );
};

export default ReviewModal;
