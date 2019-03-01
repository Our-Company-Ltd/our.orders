import * as React from 'react';
// import 'react-select/dist/react-select.css';

import PersonFields from './PersonFields';
import { Person } from 'src/@types/our-orders';
import { Button } from '@material-ui/core';
import { InjectedIntlProps } from 'react-intl';

export type PersonFormProps = InjectedIntlProps & {
    model: Person;
    hasRights: boolean;

    onDone: () => void;
};

type State = {
    changes: Partial<Person>;
};

class PersonForm extends React.Component<PersonFormProps, State> {
    constructor(props: PersonFormProps) {
        super(props);
        this.state = {
            changes: {}
        };
    }

    render() {
        const { model, intl, hasRights } = this.props;
        const onChange = (changes: Partial<Person>) => this.setState(() => ({ changes: changes }));

        const changed = !!Object.keys(this.state.changes).length;
        return (

            <div className="forms forms--person">
                <PersonFields current={model} onChange={onChange} intl={intl} hasRights={hasRights} />
                {changed &&
                    <React.Fragment>
                        <Button>Save</Button>
                        <Button onClick={() => this.props.onDone()}>Cancel</Button>
                    </React.Fragment>
                }
                {!changed &&
                    <Button onClick={() => this.props.onDone()}>Close</Button>
                }

            </div>);
    }
}

export default PersonForm;