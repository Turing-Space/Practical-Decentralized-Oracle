import csv
import glob
import matplotlib.pyplot as plt

def getAve(arr):
    return sum([int(x) for x in arr]) / len(arr)

def getListOfFiles(re):
    return sorted(glob.glob(re))

### Global Variables
ans = []
fileRE = './Exp3*.csv'


### Main Execution
for file_name in getListOfFiles(fileRE):
    with open(file_name, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',')
        for row in spamreader:
            print(file_name, row)
            # res = getAve(row[1:])
            res = getAve(row)
            
            print(res)
            ans.append(res)

plt.plot(ans)
plt.show()
