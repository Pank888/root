import json
import sys
from pprint import pprint
from subprocess import check_output

if len(sys.argv) == 2:
  containerName = str(sys.argv[1])

  container = json.loads(check_output("docker inspect " + containerName, shell=True))[0]

  print container["NetworkSettings"]["IPAddress"]

if len(sys.argv) != 2:
  print "wrong number of args, expecting one"