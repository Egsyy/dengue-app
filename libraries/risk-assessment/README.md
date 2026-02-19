# Dengue Risk Assessment Library

A comprehensive TypeScript library for assessing dengue risk levels based on prediction values, with integrated suggestion systems and React hooks for easy integration into web applications.

## Overview

This library provides:

- **Risk Level Assessment**: Categorize dengue prediction values into risk levels (Low, Moderate, High, Critical)
- **Smart Suggestions**: Context-aware recommendations for each risk level
- **React Hooks**: Easy integration with React applications
- **Caching System**: Built-in caching for performance optimization
- **Trend Analysis**: Track risk trends over time
- **Batch Processing**: Assess multiple locations simultaneously
- **DaisyUI Integration**: Styled components compatible with DaisyUI design system

## Installation

The library is already integrated into your Dengue Watch application. All components and utilities are available for immediate use.

## Core Concepts

### Risk Levels

The library categorizes dengue risk into four levels:

| Risk Level | Range   | Color  | Urgency  |
| ---------- | ------- | ------ | -------- |
| Low        | 0-30%   | Green  | Low      |
| Moderate   | 31-60%  | Yellow | Medium   |
| High       | 61-80%  | Red    | High     |
| Critical   | 81-100% | Red    | Critical |

### Assessment Components

- **Risk Score**: Adjusted prediction value considering historical context
- **Risk Percentage**: Raw prediction value from API
- **Suggestions**: Actionable recommendations categorized by type
- **Urgency Level**: Priority level for response actions

## Basic Usage

### 1. Quick Risk Assessment

```typescript
import { quickRiskAssessment } from "@/libraries/risk-assessment/DengueRiskAssessment";

const result = quickRiskAssessment(75);
console.log(result.riskLevel); // "high"
console.log(result.suggestions); // Array of recommendations
```

### 2. Using React Hook

```typescript
import { useDengueRiskAssessment } from "@/libraries/hooks/useDengueRiskAssessment";

function MyComponent() {
  const { riskResult, isLoading, error, refetch } = useDengueRiskAssessment({
    psgccode: "0931700001",
    selectedDate: "2025-01-15",
    enableCache: true,
    includeHistoricalContext: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Risk Level: {riskResult?.riskLevel}</h2>
      <p>Risk Score: {riskResult?.riskScore}</p>
    </div>
  );
}
```

### 3. Using the Risk Assessment Card Component

```typescript
import RiskAssessmentCard from "@/components/app/RiskAssessmentCard";

function Dashboard() {
  const riskResult = quickRiskAssessment(70);

  return (
    <RiskAssessmentCard
      riskResult={riskResult}
      barangayName="Sample Barangay"
      showDetails={true}
      showSuggestions={true}
    />
  );
}
```

## Advanced Usage

### 1. Comprehensive Dashboard

```typescript
import DengueRiskDashboard from "@/components/app/DengueRiskDashboard";

function App() {
  return (
    <DengueRiskDashboard
      showTrendAnalysis={true}
      showBatchComparison={true}
      showAnalytics={true}
    />
  );
}
```

### 2. Batch Risk Assessment

```typescript
import { useBatchRiskAssessment } from "@/libraries/hooks/useDengueRiskAssessment";

function BatchAnalysis() {
  const { results, isLoading, assessMultiple } = useBatchRiskAssessment();

  const handleBatchAssessment = () => {
    const barangayData = [
      { psgccode: "0931700001", selectedDate: "2025-01-15" },
      { psgccode: "0931700002", selectedDate: "2025-01-15" },
      { psgccode: "0931700003", selectedDate: "2025-01-15" },
    ];

    assessMultiple(barangayData);
  };

  return (
    <div>
      <button onClick={handleBatchAssessment}>Assess Multiple Barangays</button>
      {results.map((result, index) => (
        <div key={index}>
          {result.psgccode}: {result.result?.riskLevel}
        </div>
      ))}
    </div>
  );
}
```

### 3. Trend Analysis

```typescript
import { useDengueRiskAssessment } from "@/libraries/hooks/useDengueRiskAssessment";
import { subWeeks, addWeeks, format } from "date-fns";

function TrendAnalysis() {
  const { riskTrend, isTrendLoading, fetchRiskTrend } = useDengueRiskAssessment(
    {
      psgccode: "0931700001",
      selectedDate: format(new Date(), "yyyy-MM-dd"),
    }
  );

  useEffect(() => {
    const startDate = format(subWeeks(new Date(), 8), "yyyy-MM-dd");
    const endDate = format(addWeeks(new Date(), 4), "yyyy-MM-dd");
    fetchRiskTrend(startDate, endDate);
  }, [fetchRiskTrend]);

  return (
    <div>
      <h3>Risk Trend</h3>
      {riskTrend?.map((item, index) => (
        <div key={index}>
          {item.date}: {item.riskLevel} ({item.trend})
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### DengueRiskAssessment Class

#### Static Methods

- `getRiskConfig(predictionValue: number): RiskLevelConfig`
- `calculateRiskScore(predictionValue: number, historicalAverage?: number): number`
- `getUrgencyLevel(riskLevel: RiskLevel): string`
- `getSuggestions(riskLevel: RiskLevel, category?: string): string[]`
- `getPreventiveMeasures(riskLevel: RiskLevel): string[]`
- `assessRisk(dengueCase: DengueCase, historicalAverage?: number): RiskAssessmentResult`
- `quickRiskAssessment(predictionValue: number): RiskAssessmentResult`
- `getRiskTrend(currentValue: number, previousValue: number): string`
- `getProgressValue(predictionValue: number): number`
- `getRiskLevelText(riskLevel: RiskLevel): string`
- `getAlertMessage(riskLevel: RiskLevel, barangayName?: string): string`

### Interfaces

#### RiskAssessmentResult

```typescript
interface RiskAssessmentResult {
  riskLevel: RiskLevel;
  riskScore: number;
  riskPercentage: number;
  config: RiskLevelConfig;
  suggestions: string[];
  preventiveMeasures: string[];
  urgencyLevel: "low" | "medium" | "high" | "critical";
}
```

#### RiskLevelConfig

```typescript
interface RiskLevelConfig {
  level: RiskLevel;
  threshold: { min: number; max: number };
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}
```

### React Hooks

#### useDengueRiskAssessment

```typescript
const {
  riskResult, // RiskAssessmentResult | null
  isLoading, // boolean
  error, // string | null
  refetch, // () => Promise<void>
  riskTrend, // TrendData[] | null
  isTrendLoading, // boolean
  fetchRiskTrend, // (startDate: string, endDate: string) => Promise<void>
  quickAssess, // (predictionValue: number) => RiskAssessmentResult
} = useDengueRiskAssessment(options);
```

#### Options

```typescript
interface UseDengueRiskAssessmentOptions {
  psgccode?: string;
  selectedDate?: string;
  enableCache?: boolean;
  includeHistoricalContext?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}
```

## Integration with Existing Components

### Updating InformationTab

The InformationTab component has been updated to use the risk assessment library:

```typescript
import { quickRiskAssessment } from "@/libraries/risk-assessment/DengueRiskAssessment";
import RiskAssessmentCard from "@/components/app/RiskAssessmentCard";

// In your component:
const riskResult = quickRiskAssessment(predictionValue);

return (
  <RiskAssessmentCard
    riskResult={riskResult}
    barangayName={SelectedBarangay?.Name}
  />
);
```

## Caching

The library includes a built-in caching system to improve performance:

- Cache duration: 5 minutes (configurable)
- Cache key: `${psgccode}-${selectedDate}`
- Automatic cache invalidation

### Cache Management

```typescript
import { riskAssessmentCache } from "@/libraries/risk-assessment/RiskAssessmentIntegration";

// Clear cache
riskAssessmentCache.clear();

// Get cache size
riskAssessmentCache.size();

// Check cached value
const cached = riskAssessmentCache.get(psgccode, selectedDate);
```

## Styling and Theming

The library is designed to work seamlessly with DaisyUI:

- Color classes use DaisyUI naming conventions
- Components are responsive and accessible
- Theme-aware styling

### Custom Styling

```typescript
// Access risk level colors
const config = DengueRiskAssessment.getRiskConfig(75);
// config.color -> "text-error"
// config.bgColor -> "bg-error"
// config.borderColor -> "border-error"
```

## Error Handling

The library provides comprehensive error handling:

- API failures are caught and logged
- Graceful fallbacks for missing data
- TypeScript interfaces ensure type safety

### Error Patterns

```typescript
try {
  const result = await fetchAndAssessRisk(psgccode, selectedDate);
  if (!result) {
    // Handle null result
    console.error("No risk assessment data available");
  }
} catch (error) {
  console.error("Risk assessment failed:", error);
}
```

## Performance Considerations

1. **Caching**: Enable caching for frequently accessed data
2. **Batch Processing**: Use batch assessment for multiple locations
3. **Lazy Loading**: Load trend data on demand
4. **Debouncing**: Implement debouncing for rapid user inputs

## Testing

The library includes sample data and demo functionality:

```typescript
// Use demo component for testing
<DengueRiskDashboard showDemo={true} />;

// Quick assessment with test data
const result = quickRiskAssessment(85); // Critical risk
```

## Future Enhancements

Potential improvements to consider:

1. **Machine Learning Integration**: Enhanced prediction models
2. **Weather Data Integration**: Correlate with weather patterns
3. **Mobile Notifications**: Push notifications for high-risk areas
4. **GIS Integration**: Map-based visualization
5. **Historical Pattern Analysis**: Long-term trend identification

## Support

For issues or questions about the risk assessment library:

1. Check the console for error messages
2. Verify API connectivity
3. Ensure proper data formats
4. Review TypeScript interfaces for correct usage
