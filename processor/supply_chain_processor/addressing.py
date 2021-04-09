

import hashlib


def _hash(string):
    return hashlib.sha512(string.encode('utf-8')).hexdigest()


# The first six characters of a T&T address are the first six
# characters of the hash of the T&T family name. The next two
# characters depend on the type of object being stored. There is no
# formula for deriving these infixes.

FAMILY_NAME = 'supply_chain'

NAMESPACE = _hash(FAMILY_NAME)[:6]

AGENT = 'ae'
PROPERTY = 'ea'
PROPOSAL = 'aa'
RECORD = 'ec'
RECORD_TYPE = 'ee'


def make_agent_address(identifier):
    return (
        NAMESPACE
        + AGENT
        + _hash(identifier)[:62]
    )


def make_record_address(record_id):
    return (
        NAMESPACE
        + RECORD
        + _hash(record_id)[:62]
    )


def make_record_type_address(type_name):
    return (
        NAMESPACE
        + RECORD_TYPE
        + _hash(type_name)[:62]
    )


RECORD_TYPE_ADDRESS_RANGE = NAMESPACE + RECORD_TYPE


def make_property_address(record_id, property_name, page=0):
    return (
        make_property_address_range(record_id)
        + _hash(property_name)[:22]
        + _num_to_page_number(page)
    )


def _num_to_page_number(num):
    return hex(num)[2:].zfill(4)


def make_property_address_range(record_id):
    return (
        NAMESPACE
        + PROPERTY
        + _hash(record_id)[:36]
    )


def make_proposal_address(record_id, agent_id):
    return (
        NAMESPACE
        + PROPOSAL
        + _hash(record_id)[:36]
        + _hash(agent_id)[:26]
    )
