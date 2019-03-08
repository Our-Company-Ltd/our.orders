declare module 'react-to-print' {
    import { ReactNode, Ref } from "react";
    class ReactToPrint extends React.Component<{
        trigger: () => ReactNode;
        content: () => ReactNode;
        copyStyles?: boolean;
        onBeforePrint?: () => void;
        onAfterPrint?: () => void;
    }> { 
        public handlePrint: () => void 
    }
    export default ReactToPrint;
}