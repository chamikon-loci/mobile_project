export default function App() {
    const [currentpage, setpage] = useState('Login');

    return (
        <View style={{ flex: 1 }}>
            <Text
                style={{ fontSize: 30 }}
                onPress={() => setpage('TableMap')}
            >
                {currentpage}
            </Text>
        </View>
    );
}