import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
} from 'react-native';

export type CompletionFilter = 'ALL' | 'COMPLETED' | 'PENDING';
export type PriorityFilter = number | 'ALL';
export type CategoryFilter = 'ALL' | 'WORK' | 'PERSONAL' | 'ACADEMIC' | 'HEALTH' | 'SYSTEM';
export type SortField = 'priority' | 'deadline' | 'created_at' | 'title' | 'category';
export type SortOrder = 'asc' | 'desc';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    completedFilter: CompletionFilter;
    setCompletedFilter: (val: CompletionFilter) => void;
    priorityFilter: PriorityFilter;
    setPriorityFilter: (val: PriorityFilter) => void;
    categoryFilter: CategoryFilter;
    setCategoryFilter: (val: CategoryFilter) => void;
    sortField: SortField;
    setSortField: (field: SortField) => void;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    onReset: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    onClose,
    searchQuery,
    setSearchQuery,
    completedFilter,
    setCompletedFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    onReset,
}) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.filterBox}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.filterTitle}>ADVANCED CONTROLS</Text>

                        {/* Search Input */}
                        <Text style={styles.filterLabel}>SEARCH OBJECTIVES</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by title..."
                            placeholderTextColor="#4B5563"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        {/* Completion Status */}
                        <Text style={styles.filterLabel}>COMPLETION STATUS</Text>
                        <View style={styles.row}>
                            {(['ALL', 'PENDING', 'COMPLETED'] as const).map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.filterChip,
                                        completedFilter === status && styles.filterChipActive,
                                    ]}
                                    onPress={() => setCompletedFilter(status)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            completedFilter === status && styles.chipTextActive,
                                        ]}
                                    >
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Category Filter */}
                        <Text style={styles.filterLabel}>TASK CATEGORY</Text>
                        <View style={styles.row}>
                            {(['ALL', 'WORK', 'PERSONAL', 'ACADEMIC', 'HEALTH', 'SYSTEM'] as const).map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.filterChip,
                                        categoryFilter === cat && styles.filterChipActive,
                                    ]}
                                    onPress={() => setCategoryFilter(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            categoryFilter === cat && styles.chipTextActive,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Priority Filter */}
                        <Text style={styles.filterLabel}>PRIORITY LEVEL</Text>
                        <View style={styles.row}>
                            {[
                                { key: 'ALL', label: 'All' },
                                { key: 0, label: '0 (Low)' },
                                { key: 1, label: '1 (Mid)' },
                                { key: 2, label: '2 (High)' },
                            ].map((p) => (
                                <TouchableOpacity
                                    key={p.key.toString()}
                                    style={[
                                        styles.filterChip,
                                        priorityFilter === p.key && styles.filterChipActive,
                                    ]}
                                    onPress={() => setPriorityFilter(p.key as PriorityFilter)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            priorityFilter === p.key && styles.chipTextActive,
                                        ]}
                                    >
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Sort Field */}
                        <Text style={styles.filterLabel}>SORT BY</Text>
                        <View style={styles.row}>
                            {[
                                { key: 'priority', label: 'Priority' },
                                { key: 'deadline', label: 'Deadline' },
                                { key: 'created_at', label: 'Created Date' },
                                { key: 'title', label: 'Title' },
                            ].map((s) => (
                                <TouchableOpacity
                                    key={s.key}
                                    style={[
                                        styles.filterChip,
                                        sortField === s.key && styles.filterChipActive,
                                    ]}
                                    onPress={() => setSortField(s.key as SortField)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            sortField === s.key && styles.chipTextActive,
                                        ]}
                                    >
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Sort Direction */}
                        <Text style={styles.filterLabel}>SORT DIRECTION</Text>
                        <View style={styles.row}>
                            {[
                                { key: 'desc', label: 'Descending' },
                                { key: 'asc', label: 'Ascending' },
                            ].map((o) => (
                                <TouchableOpacity
                                    key={o.key}
                                    style={[
                                        styles.filterChip,
                                        sortOrder === o.key && styles.filterChipActive,
                                    ]}
                                    onPress={() => setSortOrder(o.key as SortOrder)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            sortOrder === o.key && styles.chipTextActive,
                                        ]}
                                    >
                                        {o.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Action Buttons */}
                        <TouchableOpacity style={styles.deactivateBtn} onPress={onReset}>
                            <Text style={styles.deactivateText}>RESET ALL FILTERS</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
                            <Text style={styles.closeModalText}>APPLY & CLOSE</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
            {/* Sort Field */}
            <Text style={styles.filterLabel}>SORT BY</Text>
            <View style={styles.row}>
                {[
                    { key: 'deadline', label: 'Deadline' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'category', label: 'Category' },
                    { key: 'title', label: 'Title' },
                ].map((s) => (
                    <TouchableOpacity
                        key={s.key}
                        style={[
                            styles.filterChip,
                            sortField === s.key && styles.filterChipActive,
                        ]}
                        onPress={() => setSortField(s.key as SortField)}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                sortField === s.key && styles.chipTextActive,
                            ]}
                        >
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBox: {
        backgroundColor: '#141722',
        width: '88%',
        maxHeight: '85%',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1F2433',
    },
    filterTitle: {
        color: '#F3F4F6',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 12,
    },
    filterLabel: {
        color: '#6B7280',
        fontSize: 9,
        fontWeight: '700',
        marginBottom: 6,
        marginTop: 10,
    },
    searchInput: {
        backgroundColor: '#0A0B10',
        borderWidth: 1,
        borderColor: '#1F2433',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        color: '#F3F4F6',
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    filterChip: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#1F2433',
        backgroundColor: '#0A0B10',
    },
    filterChipActive: {
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    chipText: {
        color: '#6B7280',
        fontSize: 10,
    },
    chipTextActive: {
        color: '#3B82F6',
        fontWeight: '700',
    },
    deactivateBtn: {
        borderWidth: 1,
        borderColor: '#EF4444',
        padding: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 16,
    },
    deactivateText: {
        color: '#EF4444',
        fontWeight: '800',
        fontSize: 10,
    },
    closeModalBtn: {
        backgroundColor: '#3B82F6',
        padding: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    closeModalText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 10,
    },
});