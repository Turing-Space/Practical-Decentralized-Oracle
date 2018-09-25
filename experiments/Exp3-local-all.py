import csv
import glob
import matplotlib.pyplot as plt
from collections import defaultdict

def getAve(arr):
    return sum([int(x) for x in arr]) / len(arr)

def getListOfFiles(re, _pre = 7, _post = 4):
    return sorted(glob.glob(re), key=lambda s: int(s[_pre:-1 * _post]))

def getFirstRowOfCsv(file_name):
    with open(file_name, newline='') as csvfile:
        ans = []
        spamreader = csv.reader(csvfile, delimiter=' ')
        # Retun the first row
        for row in spamreader:
            ans.append(row)
        return ans

### Global Variables
file_name = './Exp3-local-all.csv'


### Main Execution
rows = getFirstRowOfCsv(file_name)
finals = defaultdict(list)
for item in rows:
    finals[int(item[0])].append(int(item[-1]))


for key, value in finals.items():
    with open('./Exp3-local-ganache-done/Exp3-local-'+str(key)+'.csv', 'a') as the_file:
        the_file.write(",".join([str(x) for x in value]))
