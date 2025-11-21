import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import React, { useState, useEffect } from "react";
import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
} from "react-native-cool-speedometer";

// --- Cấu hình Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyAMm8pc8kq2QgYxGM1Y9kFKHhmNEnw4Hl0",
  authDomain: "nha-thong-minh-17c36.firebaseapp.com",
  databaseURL:
    "https://nha-thong-minh-17c36-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nha-thong-minh-17c36",
  storageBucket: "nha-thong-minh-17c36.firebasestorage.app",
  messagingSenderId: "1044975561035",
  appId: "1:1044975561035:web:8ce29f0da3fbdf0bc020ce",
  measurementId: "G-LEY6EENLWD",
};

// --- Khởi tạo Firebase ---
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function SmartHomeScreen() {
  const [den, setDen] = useState(0);
  const [quat, setQuat] = useState(0);
  const [dieuhoa, setDieuhoa] = useState(0);
  const [tocDo, setTocDo] = useState(0);
  const [maxValue] = useState(200);

  // --- Lấy dữ liệu từ Firebase ---
  useEffect(() => {
    const starCountRef = ref(db, "thietbi");
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDen(data.den?.trangthai ?? 0);
        setQuat(data.quat?.trangthai ?? 0);
        setDieuhoa(data.dieuhoa?.trangthai ?? 0);
        setTocDo(data.tocdo?.giatri ?? 0);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Gửi lệnh điều khiển ---
  const dieuKhienThietBi = (ten: string, trangThaiHienTai: number) => {
    const trangThaiMoi = trangThaiHienTai === 1 ? 0 : 1;
    set(ref(db, `thietbi/${ten}`), { trangthai: trangThaiMoi });

    // Cập nhật giao diện ngay
    if (ten === "den") setDen(trangThaiMoi);
    if (ten === "quat") setQuat(trangThaiMoi);
    if (ten === "dieuhoa") setDieuhoa(trangThaiMoi);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}> HỆ THỐNG NHÀ THÔNG MINH</Text>

      {/* Đồng hồ tốc độ */}
      <View style={styles.speedometerContainer}>
        <Speedometer value={tocDo} max={maxValue} fontFamily="squada-one">
          <Background />
          <Arc />
          <Needle />
          <Progress />
          <Marks step={20} />
        </Speedometer>
        <Text style={styles.speedLabel}>Tốc độ quạt: {tocDo} RPM</Text>
      </View>

      {/* Lưới thiết bị */}
      <View style={styles.deviceGrid}>
        <DeviceCard
          name="Đèn phòng khách"
          icon="💡"
          status={den}
          onPress={() => dieuKhienThietBi("den", den)}
        />
        <DeviceCard
          name="Quạt"
          icon="🌀"
          status={quat}
          onPress={() => dieuKhienThietBi("quat", quat)}
        />
        <DeviceCard
          name="Điều hòa"
          icon="❄️"
          status={dieuhoa}
          onPress={() => dieuKhienThietBi("dieuhoa", dieuhoa)}
        />
      </View>

      {/* Thông tin người dùng */}
      <View style={styles.userInfo}>
        <Text style={styles.infoTitle}>👤 Thông tin người dùng</Text>
        <TextInput style={styles.input} placeholder="Nhập tên người dùng" />
        <TextInput
          style={styles.input}
          placeholder="ID thiết bị (VD: 123456)"
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );
}

interface DeviceCardProps {
  name: string;
  icon: string;
  status: number;
  onPress: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  name,
  icon,
  status,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.deviceCard,
        { backgroundColor: status === 1 ? "#e74c3c" : "#27ae60" }, // đỏ khi bật, xanh khi tắt
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.deviceIcon}>{icon}</Text>
      <Text style={styles.deviceName}>{name}</Text>
      <Text style={styles.deviceStatus}>
        {status === 1 ? "🔴 Đang bật" : "🟢 Đang tắt"}
      </Text>
    </TouchableOpacity>
  );
};

// --- CSS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f3",
    paddingVertical: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: 25,
  },
  speedometerContainer: {
    alignItems: "center",
    marginBottom: 35,
  },
  speedLabel: {
    fontSize: 18,
    marginTop: 10,
    color: "#2c3e50",
    fontWeight: "500",
  },
  deviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  deviceCard: {
    width: "40%",
    margin: 10,
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  deviceIcon: {
    fontSize: 38,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginTop: 8,
  },
  deviceStatus: {
    color: "#fff",
    marginTop: 5,
    fontStyle: "italic",
  },
  userInfo: {
    marginTop: 45,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 12,
    color: "#2c3e50",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    width: "80%",
    marginTop: 10,
    backgroundColor: "#fff",
  },
});
