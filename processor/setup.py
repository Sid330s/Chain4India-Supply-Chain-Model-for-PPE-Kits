
from __future__ import print_function

import os
import subprocess

from setuptools import setup, find_packages


data_files = []

if os.path.exists("/etc/default"):
    data_files.append(('/etc/default',
                       ['packaging/systemd/supply-chain-tp']))

if os.path.exists("/lib/systemd/system"):
    data_files.append(('/lib/systemd/system',
                       ['packaging/systemd/supply-chain-tp.service']))

setup(name='sawtooth-supply-chain-tp',
      version=subprocess.check_output(
          ['../bin/get_version']).decode('utf-8').strip(),
      description='Sawtooth Supply Chain Transaction Processor',
      author='Intel Corporation',
      url='https://github.com/hyperledger/sawtooth-supply-chain',
      packages=find_packages(),
      install_requires=[
          'colorlog',
          'protobuf',
          'sawtooth-sdk',
          ],
      data_files=data_files,
      entry_points={
          'console_scripts': [
              'supply-chain-tp=supply_chain_processor.main:main'
          ]
      })
