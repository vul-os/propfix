import { Box } from '@mui/material';
import { fShortenNumber } from '../../../../../utils/formatNumber';

export const MyBoxComponent = ({ children, ...props }) => (
    <Box sx={{ p: 3, pb: 1 }} dir="ltr" {...props}>
        {children}
    </Box>
);

const DATA_INDEX = "Total_Revenue"
const LABELS_INDEX = "ProductName"

export function generateChartConfigBar(responseData, displayName, theme) {
    // Manipulate data
    const data = [{
        name: displayName,
        type: 'column',
        fill: 'solid',
        data: responseData[DATA_INDEX]
    }]
    const labels = responseData[LABELS_INDEX]
    // Generate options
    const options = {
        labels,
        plotOptions: { bar: { columnWidth: '26%' } },
        fill: { type: data.map((item) => item.fill) },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (y) => {
                    if (typeof y !== 'undefined') {
                        return `${y.toFixed(0)} visits`;
                    }
                    return y;
                },
            },
        },
        yaxis: {
            labels: {
                formatter: (value) => fShortenNumber(value),
            },
        },
        chart: {
            toolbar: {
                show: true, // You can set this to false to completely hide the toolbar
                tools: {
                    download: false, // Disables the download button
                }
            },
            zoom: {
                enabled: true,
                type: 'x',
                autoScaleYaxis: false,
                zoomedArea: {
                    fill: {
                        color: '#90CAF9',
                        opacity: 0.4
                    },
                    stroke: {
                        color: '#0D47A1',
                        opacity: 0.4,
                        width: 1
                    }
                }
            }
        },
        xaxis: { type: 'category', tickPlacement: 'on' },
    };


    return { data, options };
}

export const ChartOptionsBar = {
    title: "Product Distribution",
    subheader: "(+43%) than last year",
    name: "revenue_product",
    displayName: 'Sales',
    templates: {
        date_start: '2023-01-01',
        date_end: '2023-06-07'
    },
    type: 'bar',
    WrapperComponent: MyBoxComponent,
    generateChartConfig: generateChartConfigBar, // or generateChartDataPie
};
