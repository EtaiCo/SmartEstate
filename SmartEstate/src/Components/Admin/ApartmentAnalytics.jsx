import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ApartmentAnalytics = () => {
  const [ads, setAds] = useState([]);
  const [typeStats, setTypeStats] = useState([]);
  const [avgPricePerRoom, setAvgPricePerRoom] = useState({
    sale: [],
    rent: [],
  });
  const [adsByDate, setAdsByDate] = useState([]);
  const [adTypeStats, setAdTypeStats] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get("http://localhost:8000/admin/ads", {
          withCredentials: true,
        });
        setAds(response.data);
        generateStats(response.data);
      } catch (error) {
        console.error("Error fetching apartment ads:", error);
      }
    };

    const generateStats = (adsData) => {
      // Property type distribution
      const typeCount = {};
      adsData.forEach((ad) => {
        typeCount[ad.property_type] = (typeCount[ad.property_type] || 0) + 1;
      });
      const typeStatsFormatted = Object.entries(typeCount).map(
        ([type, count]) => ({
          name: type,
          value: count,
        })
      );
      setTypeStats(typeStatsFormatted);

      // Ad type distribution (מכירה / השכרה)
      const adTypeCount = { מכירה: 0, השכרה: 0 };
      adsData.forEach((ad) => {
        if (ad.ad_type === "מכירה" || ad.ad_type === "השכרה") {
          adTypeCount[ad.ad_type]++;
        }
      });
      const adTypeStatsFormatted = Object.entries(adTypeCount).map(
        ([type, count]) => ({
          name: type,
          value: count,
        })
      );
      setAdTypeStats(adTypeStatsFormatted);

      // Avg price per room - split by ad_type
      const saleAds = adsData.filter((ad) => ad.ad_type === "מכירה");
      const rentAds = adsData.filter((ad) => ad.ad_type === "השכרה");

      const calculateAvgPrice = (adsSubset) => {
        const roomsMap = {};
        adsSubset.forEach((ad) => {
          const rooms = Math.round(ad.rooms);
          if (!roomsMap[rooms]) {
            roomsMap[rooms] = { total: 0, count: 0 };
          }
          roomsMap[rooms].total += ad.price;
          roomsMap[rooms].count += 1;
        });
        return Object.entries(roomsMap).map(([rooms, data]) => ({
          rooms,
          avgPrice: Math.round(data.total / data.count),
        }));
      };

      setAvgPricePerRoom({
        sale: calculateAvgPrice(saleAds),
        rent: calculateAvgPrice(rentAds),
      });

      // Ads by publish date
      const dateMap = {};
      adsData.forEach((ad) => {
        const date = ad.publish_date;
        dateMap[date] = (dateMap[date] || 0) + 1;
      });
      const adsDateList = Object.entries(dateMap).map(([date, count]) => ({
        date,
        count,
      }));
      setAdsByDate(adsDateList);
    };

    fetchAds();
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c"];

  return (
    <div className="container mt-4" dir="rtl">
      <h2 className="mb-4">דוח מודעות נדל"ן</h2>

      {/* Pie Chart: Property Types */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">סוגי נכסים</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={typeStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {typeStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Chart: Sale vs Rent */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">סוג מודעה (מכירה / השכרה)</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={adTypeStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {adTypeStats.map((entry, index) => (
                    <Cell
                      key={`type-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Avg Price per Room - Sale */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">מחיר ממוצע לפי מס' חדרים - מכירה</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={avgPricePerRoom.sale}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="rooms"
                  label={{
                    value: "מס' חדרים",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgPrice" name="מחיר ממוצע" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Avg Price per Room - Rent */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">מחיר ממוצע לפי מס' חדרים - השכרה</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={avgPricePerRoom.rent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="rooms"
                  label={{
                    value: "מס' חדרים",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgPrice" name="מחיר ממוצע" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ads Over Time */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">מודעות לפי תאריך פרסום</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={adsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="כמות מודעות" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentAnalytics;
