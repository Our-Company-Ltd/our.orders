import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedIntlProvider } from '../../_containers';
import Store from '../../_store';

export interface Props {
    classNames?: string[];
}
class BodyRenderer extends React.Component<Props> {
    private _container: HTMLDivElement;

    componentDidMount() {
        this._container = document.createElement('div');
        if (this.props.classNames) {
            this._container.classList.add(...this.props.classNames);
        }
        document.body.appendChild(this._container);
        this._renderLayer();
    }

    componentDidUpdate() {
        this._renderLayer();
    }

    componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(this._container);
        document.body.removeChild(this._container);
    }

    render() {
        // Render a placeholder
        return null;
    }

    private _renderLayer() {
        const children = (
            <Provider store={Store}>
                <ConnectedIntlProvider>{this.props.children}</ConnectedIntlProvider>
            </Provider>);
        ReactDOM.render(children, this._container);
    }
}
export default BodyRenderer;