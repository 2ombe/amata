// Payment history component
function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch(`${API_URL}/farmers/${user.farmerId}/payments`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        setPayments(data.payments);
      } finally {
        setLoading(false);
      }
    }
    
    loadPayments();
  }, []);
  
  return (
    <FlatList
      data={payments}
      renderItem={({ item }) => (
        <View>
          <Text>{item.quantity}L - {item.totalAmount} RWF</Text>
          <Text>{new Date(item.date).toLocaleDateString()}</Text>
          <Text>{item.status}</Text>
        </View>
      )}
    />
  );
}