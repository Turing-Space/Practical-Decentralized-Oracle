import csv
import glob
import matplotlib.pyplot as plt

def getAve(arr):
    return sum([int(x) for x in arr]) / len(arr)

def getListOfFiles(re):
    return sorted(glob.glob(re), key=lambda s: int(s[7:-4]))

def getFirstRowOfCsv(file_name):
    with open(file_name, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',')
        # Retun the first row
        for row in spamreader:
            return row

### Global Variables
ans = []
fileRE = './Exp3-*.csv'


### Main Execution
for file_name in getListOfFiles(fileRE):
    row = getFirstRowOfCsv(file_name)    
    ans.append(getAve(row))

# Plot
plt.plot(ans)
plt.show()
