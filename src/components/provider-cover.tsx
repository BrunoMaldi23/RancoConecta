import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';

type Props = {
  uri?: string;
  style?: StyleProp<ImageStyle>;
};

export function ProviderCover({ uri, style }: Props) {
  if (uri) {
    return <Image source={{ uri }} style={style} contentFit="cover" />;
  }

  return (
    <View style={[style, styles.placeholder]}>
      <Ionicons name="storefront-outline" size={22} color="#9AA7B3" />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EFF4',
  },
});