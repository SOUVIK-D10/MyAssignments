import { ListRenderItem, View, Text } from "react-native";
import { CardStyle } from "../../Styles";
import { Ionicons } from '@expo/vector-icons'
import { LeadPayload } from "../state/useStore";

interface CardProps {
  lead: LeadPayload;
  isDark?: boolean;
}

export default function Card({ lead, isDark = true }: CardProps) {
  return (
    <View style={[CardStyle.card, isDark ? CardStyle.darkCard : CardStyle.lightCard]}>
      <View style={CardStyle.cardHeader}>
        <View style={CardStyle.nameContainer}>
          <Ionicons name="person-circle-outline" size={24} color="#6366f1" />
          <Text style={[CardStyle.leadName, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
            {lead.name || 'N/A'}
          </Text>
        </View>
        <View style={CardStyle.badge}>
          <Text style={CardStyle.badgeText}>NEW</Text>
        </View>
      </View>

      <View style={CardStyle.cardBody}>
        <View style={CardStyle.infoRow}>
          <Ionicons name="mail-outline" size={16} color={isDark ? '#94a3b8' : '#64748b'} />
          <Text style={[CardStyle.infoText, { color: isDark ? '#cbd5e1' : '#334155' }]}>
            {lead.email || 'N/A'}
          </Text>
        </View>
        <View style={CardStyle.infoRow}>
          <Ionicons name="call-outline" size={16} color={isDark ? '#94a3b8' : '#64748b'} />
          <Text style={[CardStyle.infoText, { color: isDark ? '#cbd5e1' : '#334155' }]}>
            {lead.phone || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={[CardStyle.cardFooter, { borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
        <Text style={CardStyle.footerText}>
          {lead.created_time ? new Date(lead.created_time * 1000).toLocaleTimeString() : 'Just now'}
        </Text>
        <Text style={CardStyle.footerText}>Form ID: {lead.form_id || 'N/A'}</Text>
      </View>
    </View>
  );
}